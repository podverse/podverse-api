import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { addOrUpdateHistoryItem, createUser, deleteUser, getCompleteUserDataAsJSON,
  getPublicUser, getUserMediaRefs, getUserPlaylists, toggleSubscribeToUser,
  updateQueueItems, updateUser, getPublicUsers } from 'controllers/user'
import { delimitQueryValues } from 'lib/utility'
import { parseQueryPageOptions } from 'middleware/parseQueryPageOptions'
import { validateUserCreate } from 'middleware/queryValidation/create'
import { validateUserSearch } from 'middleware/queryValidation/search'
import { validateUserAddOrUpdateHistoryItem, validateUserUpdate,
  validateUserUpdateQueue } from 'middleware/queryValidation/update'
import { hasValidMembership } from 'middleware/hasValidMembership'
import { jwtAuth } from 'middleware/auth/jwtAuth'

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

// Create
router.post('/',
  validateUserCreate,
  async ctx => {
    try {
      const body = ctx.request.body
      const user = await createUser(body)

      const filteredUser = {
        email: user.email,
        historyItems: user.historyItems,
        id: user.id,
        name: user.name,
        playlists: user.playlists,
        queueItems: user.queueItems,
        subscribedPlaylistIds: user.subscribedPlaylistIds,
        subscribedPodcastIds: user.subscribedPodcastIds,
        subscribedUserIds: user.subscribedUserIds
      }

      ctx.body = filteredUser
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
router.patch('/',
  validateUserUpdate,
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
router.patch('/update-queue',
  validateUserUpdateQueue,
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
router.get('/download/:id',
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
router.get('/toggle-subscribe/:id',
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
