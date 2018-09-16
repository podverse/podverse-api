import * as cors from '@koa/cors'
import * as dotenv from 'dotenv'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as jwt from 'koa-jwt'

import { config } from 'config'
import { logger, loggerInstance } from 'logging'
import { authorRouter, categoryRouter, episodeRouter, feedUrlRouter,
  mediaRefRouter, playlistRouter, podcastRouter, userRouter } from 'routes'
import { databaseInitializer } from 'initializers/database'

const bootstrap = async () => {
  dotenv.config({ path: './env' })

  await databaseInitializer()

  const app = new Koa()

  app.use(helmet())
  app.use(cors())
  app.use(logger())
  app.use(bodyParser())

  // app.use(jwt({ secret: config.jwtSecret }))

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
      // handled in emitError
    } else {
      loggerInstance.log('error', error)
      ctx.body = 'Something went wrong :('
    }
  })


  app.listen(config.port)

  console.log(`Server running on port ${config.port}`)
}

bootstrap()
