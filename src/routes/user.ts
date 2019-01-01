import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { addOrUpdateHistoryItem, createUser, deleteUser, getCompleteUserDataAsJSON,
  updateQueueItems, updateUser } from 'controllers/user'
import { validateUserCreate } from 'middleware/queryValidation/create'
import { validateUserAddOrUpdateHistoryItem, validateUserUpdate,
  validateUserUpdateQueue } from 'middleware/queryValidation/update'
import { hasValidMembership } from 'middleware/hasValidMembership'
import { jwtAuth } from 'middleware/auth/jwtAuth'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user` })

router.use(bodyParser())

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
        subscribedPodcastIds: user.subscribedPodcastIds
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

// Get
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

export default router
