import * as Router from 'koa-router'
import { deleteUser, getUser, getUsers } from 'controllers/user'
import { validateUserQuery } from './validation/query'
import { emitError } from 'routes/error'

const router = new Router({ prefix: '/user' })

// Search
router.get('/',
  validateUserQuery,
  async ctx => {
    try {
      const users = await getUsers(ctx.request.query)
      ctx.body = users
    } catch (error) {
      emitError(500, null, error, ctx)
    }
  }
)

// Get
router.get('/:id', async ctx => {
  try {
    const user = await getUser(ctx.params.id)
    ctx.body = user
  } catch (error) {
    emitError(ctx.status, error.message, error, ctx)
  }
})

// Delete
router.delete('/:id', async ctx => {
  try {
    await deleteUser(ctx.params.id)
    ctx.status = 200
  } catch (error) {
    emitError(ctx.status, error.message, error, ctx)
  }
})

export default router
