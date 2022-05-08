import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { createNotification, deleteNotification } from '~/controllers/notification'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import {
  validateNotificationSubscribe,
  validateNotificationUnsubscribe
} from '~/middleware/queryValidation/notification'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/notification` })
router.use(bodyParser())

const notificationSubscribeLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/notification/subscribe'
})

// Create a Notification for a logged-in user to a podcast
router.post('/podcast/subscribe', notificationSubscribeLimiter, jwtAuth, validateNotificationSubscribe, async (ctx) => {
  try {
    const { podcastId } = ctx.request.body as any
    await createNotification(podcastId, ctx.state.user.id)
    ctx.status = 200
    ctx.body = {
      message: 'Notification created'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

const notificationUnsubscribeLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/notification/unsubscribe'
})

// Delete a Notification for a logged-in user to a podcast
router.post(
  '/podcast/unsubscribe',
  notificationUnsubscribeLimiter,
  jwtAuth,
  validateNotificationUnsubscribe,
  async (ctx) => {
    try {
      const { podcastId } = ctx.request.body as any
      await deleteNotification(podcastId, ctx.state.user.id)
      ctx.status = 200
      ctx.body = {
        message: 'Notification deleted'
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

export const notificationRouter = router
