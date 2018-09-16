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
      emitError(error, error.message, ctx)
    }
  }
)

// Get
router.get('/:id', async ctx => {
  const user = await getUser(ctx.params.id)
  ctx.body = user
})

// Delete
router.delete('/:id', async ctx => {
  const user = await deleteUser(ctx.params.id)
  ctx.status = 200
})

export default router
