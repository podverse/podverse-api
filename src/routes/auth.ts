import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { authenticate, emailNotExists, localAuth, registerUser, sendResetPassword,
  sendVerification, validEmail, verifyEmail } from 'middleware/auth'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/auth` })

router.use(bodyParser())

router.post('/register', validEmail, emailNotExists, registerUser)

router.post('/login', localAuth, authenticate)

router.post('/reset-password', sendResetPassword)

router.post('/send-verification', sendVerification)

router.get('/verify-email', verifyEmail)

export default router
