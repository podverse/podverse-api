import * as Router from 'koa-router'
import { config } from 'config'
import { authenticate, localAuth } from 'middleware/auth'
import { emailNotExists, registerUser, validEmail } from 'middleware/auth/registerUser'
import { jwtAuth } from 'middleware/auth/jwtAuth'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/auth` })

router.post('/register', validEmail, emailNotExists, registerUser)

router.post('/login', localAuth, authenticate)

export default router
