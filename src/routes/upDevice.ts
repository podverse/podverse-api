import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { createUPDevice, deleteUPDevice, updateUPDevice } from '~/controllers/upDevice'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import {
  validateUPDeviceCreate,
  validateUPDeviceDelete,
  validateUPDeviceUpdate
} from '~/middleware/queryValidation/upDevice'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/up-device` })
router.use(bodyParser())

const createUPDeviceLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/up-device/create'
})

// Create an UPDevice for a logged-in user
router.post('/create', createUPDeviceLimiter, jwtAuth, validateUPDeviceCreate, async (ctx) => {
  try {
    const { upEndpoint, upPublicKey, upAuthKey } = ctx.request.body as any
    await createUPDevice({
      upEndpoint,
      upPublicKey,
      upAuthKey,
      loggedInUserId: ctx.state.user.id
    })
    ctx.status = 200
    ctx.body = {
      message: 'UPDevice created'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

const updateUPDeviceLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/up-device/update'
})

// Update an UPDevice for a logged-in user
router.post('/update', updateUPDeviceLimiter, jwtAuth, validateUPDeviceUpdate, async (ctx) => {
  try {
    const { nextUPEndpoint, previousUPEndpoint, upPublicKey, upAuthKey } = ctx.request.body as any
    await updateUPDevice({
      previousUPEndpoint,
      nextUPEndpoint,
      upPublicKey,
      upAuthKey,
      loggedInUserId: ctx.state.user.id
    })
    ctx.status = 200
    ctx.body = {
      message: 'UPDevice updated'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

const deleteUPDeviceLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/up-device/delete'
})

// Delete an UPDevice for a logged-in user
router.post('/delete', deleteUPDeviceLimiter, jwtAuth, validateUPDeviceDelete, async (ctx) => {
  try {
    console.log('wtffffff')
    const { upEndpoint } = ctx.request.body as any
    await deleteUPDevice(upEndpoint, ctx.state.user.id)
    ctx.status = 200
    ctx.body = {
      message: 'UPDevice deleted'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// // NOTE: This endpoint is just for debugging, should not be in prod.
// // Get UPDevice.upEndpoints for podcast
// router.get('/podcast/up-tokens/:podcastId', jwtAuth, async (ctx) => {
//   try {
//     const { podcastId } = ctx.params
//     const response = await getUPEndpointsForPodcastId(podcastId)
//     ctx.status = 200
//     ctx.body = {
//       upEndpoints: response
//     }
//   } catch (error) {
//     emitRouterError(error, ctx)
//   }
// })

export const upDeviceRouter = router
