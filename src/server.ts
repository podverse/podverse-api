import * as cors from '@koa/cors'
import * as dotenv from 'dotenv'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as koaStatic from 'koa-static'
import * as mount from 'koa-mount'
import * as passport from 'koa-passport'
import * as session from 'koa-session'
import * as swagger from 'koa2-swagger-ui'

import { config } from 'config'
import { logger, loggerInstance } from 'logging'
import { authRouter, authorRouter, categoryRouter, episodeRouter, feedUrlRouter,
  mediaRefRouter, playlistRouter, podcastRouter, userRouter } from 'routes'
import { databaseInitializer } from 'initializers/database'
import validatePassword from 'middleware/validation/password'

const sessionConfig = {
  key: config.sessionCookieName,
  maxAge: config.sessionExpiration
}

const bootstrap = async () => {
  dotenv.config({ path: './env' })

  await databaseInitializer()

  const app = new Koa()

  app.keys = [config.authSecretKey]
  app.use(session(sessionConfig, app))

  app.use(mount(
    `${config.apiPrefix}${config.apiVersion}/public`, koaStatic(__dirname + '/public')
  ))

  app.use(bodyParser())
  app.use(helmet())
  app.use(cors())
  app.use(logger())

  // Everytime "password" is a key in the request body, validate it.
  app.use((ctx, next) => {
    // @ts-ignore
    const password = ctx.request.body.password
    if (password) {
      const isValid = validatePassword.validate(password)
      if (!isValid) {
        ctx.body = 'Invalid password. Password must be at least 8 character, with at least 1 uppercase letter, 1 lowercase letter, and 1 number, with no spaces.'
        return
      }
    }
    next()
  })

  // Add passport method handlers
  // NOTE: passport grabs and processes the password property in every request body
  require('./middleware/auth.ts')
  app.use(passport.initialize())
  app.use(passport.session())

  app.use(swagger({
    routePrefix: `${config.apiPrefix}${config.apiVersion}/swagger`,
    swaggerOptions: {
      url: `${config.apiPrefix}${config.apiVersion}/public/swagger.json`
    }
  }))

  app.use(authRouter.routes())
  app.use(authRouter.allowedMethods())

  app.use(authorRouter.routes())
  app.use(authorRouter.allowedMethods())

  app.use(categoryRouter.routes())
  app.use(categoryRouter.allowedMethods())

  app.use(episodeRouter.routes())
  app.use(episodeRouter.allowedMethods())

  app.use(feedUrlRouter.routes())
  app.use(feedUrlRouter.allowedMethods())

  app.use(mediaRefRouter.routes())
  app.use(mediaRefRouter.allowedMethods())

  app.use(playlistRouter.routes())
  app.use(playlistRouter.allowedMethods())

  app.use(podcastRouter.routes())
  app.use(podcastRouter.allowedMethods())

  app.use(userRouter.routes())
  app.use(userRouter.allowedMethods())

  app.on('error', async (error, ctx) => {
    if (ctx.status >= 500) {
      loggerInstance.log('error', error)
      ctx.body = 'Internal Server Error'
    } else if (ctx.status >= 404) {
      ctx.body = 'Not found'
    } else if (ctx.status >= 400) {
      ctx.body = error.message
    } else {
      loggerInstance.log('error', error)
      ctx.body = 'Something went wrong :('
    }
  })

  app.listen(config.port)

  console.log(`Server running on port ${config.port}`)
}

bootstrap()
