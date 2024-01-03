import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { createFCMDevice, deleteFCMDevice, updateFCMDevice } from 'podverse-orm'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import {
  validateFCMDeviceCreate,
  validateFCMDeviceDelete,
  validateFCMDeviceUpdate
} from '~/middleware/queryValidation/fcmDevice'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/fcm-device` })
router.use(bodyParser())

const createFCMDeviceLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/fcm-device/create'
})

// Create an FCMDevice for a logged-in user
router.post('/create', createFCMDeviceLimiter, jwtAuth, validateFCMDeviceCreate, async (ctx) => {
  try {
    const { fcmToken } = ctx.request.body as any
    await createFCMDevice(fcmToken, ctx.state.user.id)
    ctx.status = 200
    ctx.body = {
      message: 'FCMDevice created'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

const updateFCMDeviceLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/fcm-device/update'
})

// Update an FCMDevice for a logged-in user
router.post('/update', updateFCMDeviceLimiter, jwtAuth, validateFCMDeviceUpdate, async (ctx) => {
  try {
    const { nextFCMToken, previousFCMToken } = ctx.request.body as any
    await updateFCMDevice(previousFCMToken, nextFCMToken, ctx.state.user.id)
    ctx.status = 200
    ctx.body = {
      message: 'FCMDevice updated'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

const deleteFCMDeviceLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/fcm-device/delete'
})

// Delete an FCMDevice for a logged-in user
router.post('/delete', deleteFCMDeviceLimiter, jwtAuth, validateFCMDeviceDelete, async (ctx) => {
  try {
    const { fcmToken } = ctx.request.body as any
    await deleteFCMDevice(fcmToken, ctx.state.user.id)
    ctx.status = 200
    ctx.body = {
      message: 'FCMDevice deleted'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// // NOTE: This endpoint is just for debugging, should not be in prod.
// // Get FCMDevice.fcmTokens for podcast
// router.get('/podcast/fcm-tokens/:podcastId', jwtAuth, async (ctx) => {
//   try {
//     const { podcastId } = ctx.params
//     const response = await getFCMTokensForPodcastId(podcastId)
//     ctx.status = 200
//     ctx.body = {
//       fcmTokens: response
//     }
//   } catch (error) {
//     emitRouterError(error, ctx)
//   }
// })

export const fcmDeviceRouter = router
