import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { authenticate, emailNotExists, jwtAuth, localAuth, logOut, optionalJwtAuth,
  resetPassword, sendResetPassword, sendVerification, signUpUser, validEmail,
  verifyEmail } from 'middleware/auth'
import { parseQueryPageOptions } from 'middleware/parseQueryPageOptions'
import { validateAuthLogin, validateAuthResetPassword, validateAuthSendResetPassword,
  validateAuthSendVerification, validateAuthSignUp, validateAuthVerifyEmail
  } from 'middleware/queryValidation/auth'
import { getLoggedInUser, getUserMediaRefs, getUserPlaylists } from 'controllers/user'
const RateLimit = require('koa2-ratelimit').RateLimit

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/auth` })

router.use(bodyParser())

router.post('/get-authenticated-user-info',
  optionalJwtAuth,
  async ctx => {
    try {
      const { user: jwtUserData } = ctx.state

      if (jwtUserData && jwtUserData.id) {
        const user = await getLoggedInUser(jwtUserData.id)
        if (user) {
          ctx.body = {
            email: user.email,
            freeTrialExpiration: user.freeTrialExpiration,
            historyItems: user.historyItems,
            id: user.id,
            isPublic: user.isPublic,
            membershipExpiration: user.membershipExpiration,
            name: user.name,
            playlists: user.playlists,
            queueItems: user.queueItems,
            subscribedPlaylistIds: user.subscribedPlaylistIds,
            subscribedPodcastIds: user.subscribedPodcastIds,
            subscribedUserIds: user.subscribedUserIds
          }
        }
      }

      ctx.status = 200
    } catch (error) {
      ctx.body = {}
      ctx.status = 403
    }
  })

// Get Logged In User's MediaRefs
router.get('/mediaRefs',
  parseQueryPageOptions,
  jwtAuth,
  async ctx => {
    try {
      const { query } = ctx.request
      const includeNSFW = ctx.headers.nsfwmode && ctx.headers.nsfwmode === 'on'
      const mediaRefs = await getUserMediaRefs(
        ctx.state.user.id,
        includeNSFW,
        true,
        query.sort,
        query.skip,
        query.take
      )
      ctx.body = mediaRefs
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Logged In User's Playlists
router.get('/playlists',
  parseQueryPageOptions,
  jwtAuth,
  async ctx => {
    try {
      const { query } = ctx.request

      const playlists = await getUserPlaylists(
        ctx.state.user.id,
        true,
        query.skip,
        query.take
      )
      ctx.body = playlists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

const loginLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: 5,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/login'
})

router.post('/login',
  validateAuthLogin,
  loginLimiter,
  localAuth,
  authenticate)

router.post('/log-out', logOut)

const resetPasswordLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: 3,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/reset-password'
})

router.post('/reset-password',
  validateAuthResetPassword,
  resetPasswordLimiter,
  resetPassword)

const sendResetPasswordLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max: 2,
  message: `You're doing that too much. Please try again in 2 minutes.`,
  prefixKey: 'post/reset-password'
})

router.post('/send-reset-password',
  validateAuthSendResetPassword,
  sendResetPasswordLimiter,
  sendResetPassword)

const sendVerificationLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max: 2,
  message: `You're doing that too much. Please try again in 2 minutes.`,
  prefixKey: 'post/reset-password'
})

router.post('/send-verification',
  validateAuthSendVerification,
  sendVerificationLimiter,
  sendVerification)

const signUpLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max: 2,
  message: `You're doing that too much. Please try again in 2 minutes.`,
  prefixKey: 'post/reset-password'
})

router.post('/sign-up',
  validateAuthSignUp,
  validEmail,
  signUpLimiter,
  emailNotExists,
  signUpUser)

const verifyEmailLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max: 2,
  message: `You're doing that too much. Please try again in 2 minutes.`,
  prefixKey: 'post/verify-email'
})

router.get('/verify-email',
  validateAuthVerifyEmail,
  verifyEmailLimiter,
  verifyEmail)

export default router
