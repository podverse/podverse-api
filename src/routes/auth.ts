import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { createUser } from 'controllers/user'
import { authenticate, localAuth } from 'middleware/auth'
import { emailNotExists, validEmail } from 'middleware/auth/registerUser'
import { jwtAuth } from 'middleware/auth/jwtAuth'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/auth` })

router.post('/register', validEmail, emailNotExists, async (ctx: any) => {
  const user = {
    email: ctx.request.body.email,
    emailVerified: false,
    password: ctx.request.body.password
  }

  try {
    const { id, email } = await createUser(user)
    ctx.body = { id, email }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

router.post('/login', localAuth, authenticate)

export default router
