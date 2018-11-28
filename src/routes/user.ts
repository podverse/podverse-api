import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { createUser, deleteUser, getUser, getUsers, updateQueueItems, updateUser
  } from 'controllers/user'
import { parseQueryPageOptions } from 'middleware/parseQueryPageOptions'
import { validateUserCreate } from 'middleware/validation/create'
import { validateUserSearch } from 'middleware/validation/search'
import { validateUserUpdate } from 'middleware/validation/update'
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

// Update
router.patch('/',
  validateUserUpdate,
  jwtAuth,
  async ctx => {
    try {
      const body = ctx.request.body
      const user = await updateUser(body, ctx.state.user.id)

      const filteredUser = {
        id: user.id,
        name: user.name,
        queueItems: user.queueItems,
        playlists: user.playlists,
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
  jwtAuth,
  async ctx => {
    try {
      const body: any = ctx.request.body
      const user = await updateQueueItems(body.queueItems, ctx.state.user.id)

      const filteredUser = {
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

export default router
