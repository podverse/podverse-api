import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import {
  getFCMsForLoggedInUser,
  subscribeToFCMForPodcast,
  unsubscribeFCMForAllPodcasts,
  unsubscribeToFCMForPodcast
} from '~/controllers/fcm'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import {
  validateFCMSubscribe,
  validateFCMUnsubscribe,
  validateFCMUnsubscribeAll
} from '~/middleware/queryValidation/fcm'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/fcm` })
router.use(bodyParser())

// Get all FCMs for logged-in user
router.get('/get-all-for-user', jwtAuth, async (ctx) => {
  try {
    const fcms = await getFCMsForLoggedInUser(ctx.state.user.id)
    ctx.status = 200
    ctx.body = fcms
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Toggle subscribe to user
const createFCMLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 20,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/fcm/podcast/subscribe'
})

// Create an FCM for a logged-in user for one podcast
router.post('/podcast/subscribe', createFCMLimiter, jwtAuth, validateFCMSubscribe, async (ctx) => {
  try {
    const { fcm, podcastId } = ctx.request.body as any
    await subscribeToFCMForPodcast(fcm, podcastId, ctx.state.user.id)
    ctx.status = 200
    ctx.body = {
      message: 'FCM subscribed for podcast'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Delete an FCM for a logged-in user for one podcast
router.post('/podcast/unsubscribe', jwtAuth, validateFCMUnsubscribe, async (ctx) => {
  try {
    const { fcm, podcastId } = ctx.request.body as any
    await unsubscribeToFCMForPodcast(fcm, podcastId, ctx.state.user.id)
    ctx.status = 200
    ctx.body = {
      message: 'FCM unsubscribed for podcast'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Delete all of the FCMs for a logged-in user
router.post('/podcast/unsubscribe/all', jwtAuth, validateFCMUnsubscribeAll, async (ctx) => {
  try {
    const { fcm } = ctx.request.body as any
    await unsubscribeFCMForAllPodcasts(fcm, ctx.state.user.id)
    ctx.status = 200
    ctx.body = {
      message: 'All FCMs for user deleted'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const fcmRouter = router
