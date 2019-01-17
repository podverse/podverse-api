import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { addOrUpdateHistoryItem, deleteUser, getCompleteUserDataAsJSON,
  getPublicUser, getUserMediaRefs, getUserPlaylists, toggleSubscribeToUser,
  updateQueueItems, updateUser, getPublicUsers } from 'controllers/user'
import { delimitQueryValues } from 'lib/utility'
import { parseQueryPageOptions } from 'middleware/parseQueryPageOptions'
import { validateUserSearch } from 'middleware/queryValidation/search'
import { validateUserAddOrUpdateHistoryItem, validateUserUpdate,
  validateUserUpdateQueue } from 'middleware/queryValidation/update'
import { hasValidMembership } from 'middleware/hasValidMembership'
import { jwtAuth } from 'middleware/auth/jwtAuth'
const RateLimit = require('koa2-ratelimit').RateLimit

const delimitKeys = []

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user` })

router.use(bodyParser())

// Get Public User
router.get('/:id',
  async ctx => {
    try {
      const user = await getPublicUser(ctx.params.id)
      ctx.body = user
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Search Public Users
router.get('/',
  parseQueryPageOptions,
  validateUserSearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const users = await getPublicUsers(ctx.request.query)
      ctx.body = users
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Public User's MediaRefs
router.get('/:id/mediaRefs',
  parseQueryPageOptions,
  async ctx => {
    try {
      const { query } = ctx.request
      const includeNSFW = ctx.headers.nsfwmode && ctx.headers.nsfwmode === 'on'
      const mediaRefs = await getUserMediaRefs(
        ctx.params.id,
        includeNSFW,
        false,
        query.sort,
        query.skip,
        query.take
      )
      ctx.body = mediaRefs
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Public User's Playlists
router.get('/:id/playlists',
  parseQueryPageOptions,
  async ctx => {
    try {
      const { query } = ctx.request

      const playlists = await getUserPlaylists(
        ctx.params.id,
        false,
        query.skip,
        query.take
      )
      ctx.body = playlists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Delete
router.delete('/:id',
  jwtAuth,
  async ctx => {
    try {
      await deleteUser(ctx.params.id, ctx.state.user.id)
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update
const updateUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: 5,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/user'
})

router.patch('/',
  validateUserUpdate,
  updateUserLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const body = ctx.request.body
      const user = await updateUser(body, ctx.state.user.id)
      ctx.body = user
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update queueItems
const updateQueueUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: 30,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/user/update-queue'
})

router.patch('/update-queue',
  validateUserUpdateQueue,
  updateQueueUserLimiter,
  jwtAuth,
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

// Add or update history item
router.patch('/add-or-update-history-item',
  validateUserAddOrUpdateHistoryItem,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      await addOrUpdateHistoryItem(body.historyItem, ctx.state.user.id)

      ctx.status = 200
      ctx.body = 'Updated user history'
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Download user data
const downloadUserLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max: 2,
  message: `You're doing that too much. Please try again in 5 minutes.`,
  prefixKey: 'get/user/download'
})

router.get('/download/:id',
downloadUserLimiter,
  jwtAuth,
  async ctx => {
    try {
      const userJSON = await getCompleteUserDataAsJSON(ctx.params.id, ctx.state.user.id)
      ctx.body = userJSON
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Toggle subscribe to user
const toggleSubscribeUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: 10,
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

export default router
