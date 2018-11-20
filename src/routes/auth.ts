import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { authenticate, emailNotExists, localAuth, logOut, resetPassword, sendResetPassword,
  sendVerification, signUpUser, validEmail, verifyEmail } from 'middleware/auth'
import { validateAuthLogin, validateAuthResetPassword, validateAuthSendResetPassword,
  validateAuthSendVerification, validateAuthSignUp, validateAuthVerifyEmail
  } from 'middleware/validation/auth'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/auth` })

router.use(bodyParser())

router.post('/login', validateAuthLogin, localAuth, authenticate)

router.post('/log-out', logOut)

router.post('/reset-password', validateAuthResetPassword, resetPassword)

router.post('/send-reset-password', validateAuthSendResetPassword, sendResetPassword)

router.post('/send-verification', validateAuthSendVerification, sendVerification)

router.post('/sign-up', validateAuthSignUp, validEmail, emailNotExists, signUpUser)

router.get('/verify-email', validateAuthVerifyEmail, verifyEmail)

export default router
