import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { deleteUser, getUser, getUsers, updateUser } from 'controllers/user'
import { validateUserQuery } from 'routes/validation/query'
import { validateUserUpdate } from 'routes/validation/update'
import { emitRouterError } from 'errors'

const router = new Router({ prefix: '/user' })

router.use(bodyParser())

// Search
router.get('/',
  validateUserQuery,
  async ctx => {
    try {
      const users = await getUsers(ctx.request.query)
      ctx.body = users
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get
router.get('/:id',
  async ctx => {
    try {
      const user = await getUser(ctx.params.id)
      ctx.body = user
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update
router.patch('/',
  validateUserUpdate,
  async ctx => {
    try {
      const body = ctx.request.body
      const user = await updateUser(body)
      ctx.body = user
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Delete
router.delete('/:id',
  async ctx => {
    try {
      await deleteUser(ctx.params.id)
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
