import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { addOrUpdateHistoryItem, createUser, deleteUser, getUser, getUsers,
  updateQueueItems } from 'controllers/user'
import { parseQueryPageOptions } from 'middleware/parseQueryPageOptions'
import { validateUserCreate } from 'middleware/validation/create'
import { validateUserSearch } from 'middleware/validation/search'
import { validateUserAddOrUpdateHistoryItem, validateUserUpdateQueue
  } from 'middleware/validation/update'
import { jwtAuth } from 'middleware/auth/jwtAuth'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user` })

router.use(bodyParser())

// Search
router.get('/',
  parseQueryPageOptions,
  validateUserSearch,
  async ctx => {
    try {
      const users = await getUsers(
        ctx.request.query,
        Object.assign(
          ctx.state.queryPageOptions,
          {
            select: [
              'id',
              'name'
            ]
          }
        )
      )
      ctx.body = users
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get
router.get('/:id',
  async ctx => {
    try {
      const user = await getUser(ctx.params.id, {
        select: [
          'id',
          'name'
        ]
      })
      ctx.body = user
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
        historyItems: user.historyItems,
        id: user.id,
        name: user.name,
        playlists: user.playlists,
        queueItems: user.queueItems,
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

// Update queueItems
router.patch('/update-queue',
  validateUserUpdateQueue,
  jwtAuth,
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

export default router
