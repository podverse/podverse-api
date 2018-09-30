import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { authenticate, emailNotExists, localAuth, registerUser, resetPassword,
  sendResetPassword, sendVerification, validEmail, verifyEmail } from 'middleware/auth'
import { validateAuthLogin, validateAuthRegister, validateAuthResetPassword,
  validateAuthSendResetPassword, validateAuthSendVerification, 
  validateAuthVerifyEmail } from 'middleware/validation/auth'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/auth` })

router.use(bodyParser())

router.post('/login', validateAuthLogin, localAuth, authenticate)

router.post('/register', validateAuthRegister, validEmail, emailNotExists, registerUser)

router.post('/reset-password', validateAuthResetPassword, resetPassword)

router.post('/send-reset-password', validateAuthSendResetPassword, sendResetPassword)

router.post('/send-verification', validateAuthSendVerification, sendVerification)

router.get('/verify-email', validateAuthVerifyEmail, verifyEmail)

export default router
