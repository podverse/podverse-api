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
      emitError(error, ctx, 500, null)
    }
  }
)

// Get
router.get('/:id', async ctx => {
  try {
    const user = await getUser(ctx.params.id)
    ctx.body = user
  } catch (error) {
    emitError(error, ctx, error.status, error.message)
  }
})

// Delete
router.delete('/:id', async ctx => {
  try {
    const user = await deleteUser(ctx.params.id)
    console.log(user);
  } catch (error) {
    console.log(error)
    emitError(error, ctx, error.status, error.message)
  }
})

export default router
