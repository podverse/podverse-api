import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as koaStatic from 'koa-static'
import * as mount from 'koa-mount'
import * as passport from 'koa-passport'
import * as Router from 'koa-router'
import { Connection } from 'typeorm'
import { config } from '~/config'
import { logger, loggerInstance } from '~/lib/logging'
import {
  accountClaimTokenRouter,
  addByRSSPodcastFeedUrlRouter,
  appStoreRouter,
  authRouter,
  authorRouter,
  categoryRouter,
  clipsRouter,
  devAdminRouter,
  episodeRouter,
  fcmDeviceRouter,
  feedUrlRouter,
  googlePlayRouter,
  liveItemRouter,
  mediaRefRouter,
  metaRouter,
  notificationRouter,
  paypalRouter,
  playlistRouter,
  podcastRouter,
  podcastIndexRouter,
  podpingRouter,
  userHistoryItemRouter,
  userNowPlayingItemRouter,
  userQueueItemRouter,
  userRouter,
  toolsRouter
} from '~/routes'
import { createJwtStrategy, createLocalStrategy } from '~/services/auth'
import { startup } from './startup'

const cookie = require('cookie')
const cors = require('@koa/cors')
const swagger = require('koa2-swagger-ui')

declare module 'koa' {
  interface BaseContext {
    db: Connection
  }
}

const rootRouter = new Router()
const routePrefix = `${config.apiPrefix}${config.apiVersion}`

const timeAppStarted = Date.now()

startup()

export const createApp = async (conn: Connection) => {
  loggerInstance.debug('Creating new Koa App')
  const app = new Koa()

  /* If in maintenance mode, always return 503 ServiceUnavailable error */
  if (config.maintenanceMode.isEnabled) {
    app.use((ctx) => {
      const { downtimeExpected } = config.maintenanceMode

      let expectedDowntimeRemaining = Math.floor(
        (timeAppStarted + downtimeExpected * 60 * 1000 - Date.now()) / 60 / 1000
      )

      expectedDowntimeRemaining = expectedDowntimeRemaining > 0 ? expectedDowntimeRemaining : 0

      ctx.status = 503
      ctx.body = {
        expectedDowntimeRemaining
      }
    })
  }

  if (!config.maintenanceMode.isEnabled) {
    app.context.db = conn

    app.use(
      cors({
        credentials: true
      })
    )

    passport.use(createLocalStrategy())
    passport.use(createJwtStrategy())

    app.use(helmet())
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

    app.use(mount(`${config.apiPrefix}${config.apiVersion}/public`, koaStatic(__dirname + '/public')))

    app.use(
      swagger({
        routePrefix: `${config.apiPrefix}${config.apiVersion}/swagger`,
        swaggerOptions: {
          url: `${config.apiPrefix}${config.apiVersion}/public/swagger.json`
        }
      })
    )

    rootRouter.get('/', async (ctx) => {
      ctx.body = 'Please visit /api/v1/swagger for current documentation.'
    })

    rootRouter.head(`${routePrefix}/network-reachability-check`, async (ctx) => {
      ctx.status = 204
    })

    app.use(rootRouter.routes())
    app.use(rootRouter.allowedMethods())

    app.use(accountClaimTokenRouter.routes())
    app.use(accountClaimTokenRouter.allowedMethods())

    app.use(addByRSSPodcastFeedUrlRouter.routes())
    app.use(addByRSSPodcastFeedUrlRouter.allowedMethods())

    app.use(appStoreRouter.routes())
    app.use(appStoreRouter.allowedMethods())

    app.use(authRouter.routes())
    app.use(authRouter.allowedMethods())

    app.use(authorRouter.routes())
    app.use(authorRouter.allowedMethods())

    // app.use(bitpayRouter.routes())
    // app.use(bitpayRouter.allowedMethods())

    app.use(categoryRouter.routes())
    app.use(categoryRouter.allowedMethods())

    app.use(clipsRouter.routes())
    app.use(clipsRouter.allowedMethods())

    app.use(devAdminRouter.routes())
    app.use(devAdminRouter.allowedMethods())

    app.use(episodeRouter.routes())
    app.use(episodeRouter.allowedMethods())

    app.use(fcmDeviceRouter.routes())
    app.use(fcmDeviceRouter.allowedMethods())

    app.use(feedUrlRouter.routes())
    app.use(feedUrlRouter.allowedMethods())

    app.use(googlePlayRouter.routes())
    app.use(googlePlayRouter.allowedMethods())

    app.use(liveItemRouter.routes())
    app.use(liveItemRouter.allowedMethods())

    app.use(mediaRefRouter.routes())
    app.use(mediaRefRouter.allowedMethods())

    app.use(metaRouter.routes())
    app.use(metaRouter.allowedMethods())

    app.use(notificationRouter.routes())
    app.use(notificationRouter.allowedMethods())

    app.use(paypalRouter.routes())
    app.use(paypalRouter.allowedMethods())

    app.use(playlistRouter.routes())
    app.use(playlistRouter.allowedMethods())

    app.use(podcastRouter.routes())
    app.use(podcastRouter.allowedMethods())

    app.use(podcastIndexRouter.routes())
    app.use(podcastIndexRouter.allowedMethods())

    app.use(podpingRouter.routes())
    app.use(podpingRouter.allowedMethods())

    app.use(toolsRouter.routes())
    app.use(toolsRouter.allowedMethods())

    app.use(userHistoryItemRouter.routes())
    app.use(userHistoryItemRouter.allowedMethods())

    app.use(userNowPlayingItemRouter.routes())
    app.use(userNowPlayingItemRouter.allowedMethods())

    app.use(userQueueItemRouter.routes())
    app.use(userQueueItemRouter.allowedMethods())

    app.use(userRouter.routes())
    app.use(userRouter.allowedMethods())

    app.use(logger())

    app.on('error', async (error) => {
      loggerInstance.log('error', error.message)
    })
  }

  return app
}
