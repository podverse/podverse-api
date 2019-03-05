import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { addOrUpdateHistoryItem, deleteUser, getCompleteUserDataAsJSON,
  getPublicUser, getUserMediaRefs, getUserPlaylists, toggleSubscribeToUser,
  updateQueueItems, updateUser, getPublicUsers } from '~/controllers/user'
import { delimitQueryValues } from '~/lib/utility'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { validateUserSearch } from '~/middleware/queryValidation/search'
import { validateUserAddOrUpdateHistoryItem, validateUserUpdate,
  validateUserUpdateQueue } from '~/middleware/queryValidation/update'
const RateLimit = require('koa2-ratelimit').RateLimit

const delimitKeys = []

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user` })

router.use(bodyParser())

// Search Public Users
router.get('/',
  validateUserSearch,
  parseNSFWHeader,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'users'),
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const users = await getPublicUsers(ctx.request.query)

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

// Get Public User's MediaRefs
router.get('/:id/mediaRefs',
  parseNSFWHeader,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'mediaRefs'),
  async ctx => {
    try {
      const { query } = ctx.request

      const mediaRefs = await getUserMediaRefs(
        ctx.params.id,
        ctx.state.includeNSFW,
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
  parseNSFWHeader,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
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

export const userRouter = router
