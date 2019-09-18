import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { addOrUpdateHistoryItem, addOrUpdateHistoryItems, clearAllHistoryItems, deleteLoggedInUser,
  getCompleteUserDataAsJSON, getPublicUser, getPublicUsers, getUserMediaRefs, getUserPlaylists, removeHistoryItem,
  toggleSubscribeToUser, updateQueueItems, updateLoggedInUser } from '~/controllers/user'
import { delimitQueryValues } from '~/lib/utility'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { validateUserSearch } from '~/middleware/queryValidation/search'
import { validateUserAddOrUpdateHistoryItem, validateUserHistoryItemRemove,
  validateUserUpdate, validateUserUpdateQueue } from '~/middleware/queryValidation/update'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const delimitKeys = []

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user` })

router.use(bodyParser())

// Toggle subscribe to user
const toggleSubscribeUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'get/toggle-subscribe'
})

router.get('/toggle-subscribe/:id',
  toggleSubscribeUserLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const subscribedUserIds = await toggleSubscribeToUser(ctx.params.id, ctx.state.user.id)
      ctx.body = subscribedUserIds
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Delete
router.delete('/',
  jwtAuth,
  async ctx => {
    try {
      await deleteLoggedInUser(ctx.state.user.id, ctx.state.user.id)
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update
const updateUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 5,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/user'
})

router.patch('/',
  updateUserLimiter,
  jwtAuth,
  validateUserUpdate,
  hasValidMembership,
  async ctx => {
    try {
      const body = ctx.request.body
      const user = await updateLoggedInUser(body, ctx.state.user.id)
      ctx.body = user
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Add or update history item
router.patch('/add-or-update-history-item',
  jwtAuth,
  validateUserAddOrUpdateHistoryItem,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      await addOrUpdateHistoryItem(body.historyItem, ctx.state.user.id)

      ctx.status = 200
      ctx.body = { message: 'Updated user history' }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Set all history items
router.patch('/add-or-update-history-items',
  jwtAuth,
  validateUserAddOrUpdateHistoryItem,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      await addOrUpdateHistoryItems(body.historyItems, ctx.state.user.id)

      ctx.status = 200
      ctx.body = { message: 'Updated user history items' }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Remove all history items
router.delete('/history-item/clear-all',
  jwtAuth,
  validateUserHistoryItemRemove,
  hasValidMembership,
  async ctx => {
    try {
      await clearAllHistoryItems(ctx.state.user.id)
      ctx.status = 200
      ctx.body = { message: 'Cleared all history items.' }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Remove history item
router.delete('/history-item',
  jwtAuth,
  async (ctx, next) => {
    const { episodeId, mediaRefId } = ctx.query
    ctx.state.query = {
      ...(episodeId ? { episodeId } : {}),
      ...(mediaRefId ? { mediaRefId } : {})
    }
    await next()
  },
  validateUserHistoryItemRemove,
  hasValidMembership,
  async ctx => {
    try {
      await removeHistoryItem(ctx.query.episodeId, ctx.query.mediaRefId, ctx.state.user.id)
      ctx.status = 200
      ctx.body = { message: 'Removed history item.' }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Download user data
const downloadUserLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max: rateLimiterMaxOverride || 2,
  message: `You're doing that too much. Please try again in 5 minutes.`,
  prefixKey: 'get/user/download'
})

router.get('/download',
  downloadUserLimiter,
  jwtAuth,
  async ctx => {
    try {
      const userJSON = await getCompleteUserDataAsJSON(ctx.state.user.id, ctx.state.user.id)
      ctx.body = userJSON
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Logged In User's MediaRefs
router.get('/mediaRefs',
  jwtAuth,
  parseNSFWHeader,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'mediaRefs'),
  async ctx => {
    try {
      const { query } = ctx.state

      const mediaRefs = await getUserMediaRefs(
        query,
        ctx.state.user.id,
        ctx.state.includeNSFW,
        true
      )
      ctx.body = mediaRefs
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Logged In User's Playlists
router.get('/playlists',
  jwtAuth,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
  async ctx => {
    try {
      const { query } = ctx.state

      const playlists = await getUserPlaylists(
        query,
        ctx.state.user.id,
        true
      )
      ctx.body = playlists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update queueItems
const updateQueueUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 30,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/user/update-queue'
})

router.patch('/update-queue',
  updateQueueUserLimiter,
  jwtAuth,
  validateUserUpdateQueue,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      const user = await updateQueueItems(body.queueItems, ctx.state.user.id)

      ctx.body = user.queueItems
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Search Public Users
router.get('/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'users'),
  validateUserSearch,
  parseNSFWHeader,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const users = await getPublicUsers(ctx.state.query)

      ctx.body = users
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Public User
router.get('/:id',
  parseNSFWHeader,
  async ctx => {
    try {
      const user = await getPublicUser(ctx.params.id)

      ctx.body = user
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Public User's MediaRefs
router.get('/:id/mediaRefs',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'mediaRefs'),
  parseNSFWHeader,
  async ctx => {
    try {
      const { query } = ctx.state

      const mediaRefs = await getUserMediaRefs(
        query,
        ctx.params.id,
        ctx.state.includeNSFW,
        false
      )
      ctx.body = mediaRefs
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Public User's Playlists
router.get('/:id/playlists',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
  parseNSFWHeader,
  async ctx => {
    try {
      const { query } = ctx.state

      const playlists = await getUserPlaylists(
        query,
        ctx.params.id,
        false
      )
      ctx.body = playlists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const userRouter = router
