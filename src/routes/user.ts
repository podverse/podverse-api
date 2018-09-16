import * as Router from 'koa-router'
import { getUser, getUsers } from 'controllers/user'
import { validateUserQuery } from 'middleware/validateQuery'

const router = new Router({ prefix: '/user' })

// Search
router.get('/',
  validateUserQuery,
  async ctx => {
    const users = await getUsers(ctx.request.query)
    ctx.body = users
  }
)

// Get
router.get('/:id', async ctx => {
  const user = await getUser(ctx.params.id)
  ctx.body = user
})

export default router
