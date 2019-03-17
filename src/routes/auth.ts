import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { authenticate, emailNotExists, jwtAuth, localAuth, logOut, optionalJwtAuth,
  resetPassword, sendResetPassword, sendVerification, signUpUser, validEmail,
  verifyEmail } from '~/middleware/auth'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateAuthLogin, validateAuthResetPassword, validateAuthSendResetPassword,
  validateAuthSendVerification, validateAuthSignUp, validateAuthVerifyEmail
  } from '~/middleware/queryValidation/auth'
import { validateUserAddOrUpdateHistoryItem, validateUserUpdate, validateUserUpdateQueue
  } from '~/middleware/queryValidation/update'
import { addOrUpdateHistoryItem, deleteLoggedInUser, getCompleteUserDataAsJSON, getLoggedInUser,
  getUserMediaRefs, getUserPlaylists, updateQueueItems, updateLoggedInUser } from '~/controllers/user'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

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
      ctx.status = 401
    }
  })

const loginLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 5,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/login'
})

router.post('/login',
  loginLimiter,
  validateAuthLogin,
  localAuth,
  authenticate)

router.post('/logout', logOut)

// Get Logged In User's MediaRefs
router.get('/mediaRefs',
  jwtAuth,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'mediaRefs'),
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
  jwtAuth,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
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

const resetPasswordLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 3,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/reset-password'
})

router.post('/reset-password',
  resetPasswordLimiter,
  validateAuthResetPassword,
  resetPassword)

const sendResetPasswordLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max:  rateLimiterMaxOverride || 2,
  message: `You're doing that too much. Please try again in 2 minutes.`,
  prefixKey: 'post/reset-password'
})

router.post('/send-reset-password',
  sendResetPasswordLimiter,
  validateAuthSendResetPassword,
  sendResetPassword)

const sendVerificationLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max:  rateLimiterMaxOverride || 2,
  message: `You're doing that too much. Please try again in 2 minutes.`,
  prefixKey: 'post/reset-password'
})

router.post('/send-verification',
  jwtAuth,
  sendVerificationLimiter,
  validateAuthSendVerification,
  async ctx => {
    try {
      await sendVerification(ctx, ctx.state.user.id)
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

const signUpLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max: rateLimiterMaxOverride || 2,
  message: `You're doing that too much. Please try again in 2 minutes.`,
  prefixKey: 'post/reset-password'
})

router.post('/sign-up',
  signUpLimiter,
  validateAuthSignUp,
  validEmail,
  emailNotExists,
  signUpUser)

// Delete
router.delete('/user',
  jwtAuth,
  async ctx => {
    try {
      await deleteLoggedInUser(ctx.state.user.id, ctx.state.user.id)
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update
const updateUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 5,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/user'
})

router.patch('/user',
  updateUserLimiter,
  jwtAuth,
  validateUserUpdate,
  hasValidMembership,
  async ctx => {
    try {
      const body = ctx.request.body
      const user = await updateLoggedInUser(body, ctx.state.user.id)
      ctx.body = user
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Add or update history item
router.patch('/user/add-or-update-history-item',
  jwtAuth,
  validateUserAddOrUpdateHistoryItem,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      await addOrUpdateHistoryItem(body.historyItem, ctx.state.user.id)

      ctx.status = 200
      ctx.body = 'Updated user history'
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Download user data
const downloadUserLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max: rateLimiterMaxOverride || 2,
  message: `You're doing that too much. Please try again in 5 minutes.`,
  prefixKey: 'get/user/download'
})

router.get('/user/download',
  downloadUserLimiter,
  jwtAuth,
  async ctx => {
    try {
      const userJSON = await getCompleteUserDataAsJSON(ctx.state.user.id, ctx.state.user.id)
      ctx.body = userJSON
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update queueItems
const updateQueueUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 30,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/user/update-queue'
})

router.patch('/user/update-queue',
  updateQueueUserLimiter,
  jwtAuth,
  validateUserUpdateQueue,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      const user = await updateQueueItems(body.queueItems, ctx.state.user.id)

      ctx.body = user.queueItems
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

const verifyEmailLimiter = RateLimit.middleware({
  interval: 5 * 60 * 1000,
  max: rateLimiterMaxOverride || 2,
  message: `You're doing that too much. Please try again in 2 minutes.`,
  prefixKey: 'post/verify-email'
})

router.get('/verify-email',
  verifyEmailLimiter,
  validateAuthVerifyEmail,
  verifyEmail)

export const authRouter = router
