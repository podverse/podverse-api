import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as koaStatic from 'koa-static'
import * as mount from 'koa-mount'
import * as passport from 'koa-passport'
import * as swagger from 'koa2-swagger-ui'
import { Connection } from 'typeorm'

import { config } from 'config'
import { User } from 'entities'
import { authRouter, authorRouter, categoryRouter, episodeRouter, feedUrlRouter,
  mediaRefRouter, paypalRouter, playlistRouter, podcastRouter, userRouter
  } from 'routes'
import { logger, loggerInstance } from 'lib/logging'
import { createJwtStrategy, createLocalStrategy } from 'services/auth'

const cookie = require('cookie')
const cors = require('@koa/cors')

declare module 'koa' {
  interface BaseContext {
    db: Connection
  }
}

export const createApp = (conn: Connection) => {

  const app = new Koa()
  app.context.db = conn

  if (process.env.NODE_ENV === 'development') {
    app.use(cors({
      credentials: true
    }))
  }

  passport.use(createLocalStrategy(conn.getRepository(User)))
  passport.use(createJwtStrategy())

  app.use(helmet())
  app.use(logger())
  app.use(bodyParser())

  app.use(passport.initialize())

  app.use(async (ctx, next) => {
    if (ctx.request.headers.cookie) {
      const parsedCookie = cookie.parse(ctx.request.headers.cookie)
      if (parsedCookie.Authorization) {
        ctx.headers.authorization = parsedCookie.Authorization
      }
    }

    await next()
  })

  app.use(mount(
    `${config.apiPrefix}${config.apiVersion}/public`, koaStatic(__dirname + '/public')
  ))

  app.use(mount(
    `/public`, koaStatic(__dirname + '/public/samples')
  ))

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

  app.use(paypalRouter.routes())
  app.use(paypalRouter.allowedMethods())

  app.use(playlistRouter.routes())
  app.use(playlistRouter.allowedMethods())

  app.use(podcastRouter.routes())
  app.use(podcastRouter.allowedMethods())

  app.use(userRouter.routes())
  app.use(userRouter.allowedMethods())

  app.on('error', async (error, ctx) => {
    if (ctx.status >= 500) {
      loggerInstance.log('error', error.message)
      ctx.body = 'Internal Server Error'
    } else if (ctx.status >= 404) {
      ctx.body = error.message || 'Not found'
    } else if (ctx.status >= 400) {
      ctx.body = error.message
    } else {
      loggerInstance.log('error', error.message)
      ctx.body = 'Something went wrong :('
    }
  })

  return app

}
