import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import {
  deleteLoggedInUser,
  getCompleteUserDataAsJSON,
  getLoggedInUserPlaylistsCombined,
  getPublicUser,
  getPublicUsers,
  getSubscribedPublicUsers,
  getUserMediaRefs,
  getUserPlaylists,
  toggleSubscribeToUser,
  updateLoggedInUser
} from '~/controllers/user'
import { delimitQueryValues } from '~/lib/utility'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { validateUserSearch } from '~/middleware/queryValidation/search'
import { validateUserUpdate } from '~/middleware/queryValidation/update'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const delimitKeys = []

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user` })

router.use(bodyParser())

// Toggle subscribe to user
const toggleSubscribeUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'get/toggle-subscribe'
})

router.get('/toggle-subscribe/:id', toggleSubscribeUserLimiter, jwtAuth, hasValidMembership, async (ctx) => {
  try {
    const subscribedUserIds = await toggleSubscribeToUser(ctx.params.id, ctx.state.user.id)
    ctx.body = subscribedUserIds
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Delete
router.delete('/', jwtAuth, async (ctx) => {
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

router.patch('/', updateUserLimiter, jwtAuth, validateUserUpdate, hasValidMembership, async (ctx) => {
  try {
    const body = ctx.request.body
    const user = await updateLoggedInUser(body, ctx.state.user.id)
    ctx.body = user
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

router.get('/download', downloadUserLimiter, jwtAuth, async (ctx) => {
  try {
    const userJSON = await getCompleteUserDataAsJSON(ctx.state.user.id, ctx.state.user.id)
    ctx.body = userJSON
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Get Logged In User's MediaRefs
router.get(
  '/mediaRefs',
  jwtAuth,
  parseNSFWHeader,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'mediaRefs'),
  async (ctx) => {
    try {
      const { query } = ctx.state

      const mediaRefs = await getUserMediaRefs(query, ctx.state.user.id, ctx.state.includeNSFW, true)
      ctx.body = mediaRefs
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get Logged In User's Playlists
router.get(
  '/playlists',
  jwtAuth,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
  async (ctx) => {
    try {
      const { query } = ctx.state

      const playlists = await getUserPlaylists(query, ctx.state.user.id)
      ctx.body = playlists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get Logged In User's Playlists Combined
router.get(
  '/playlists/combined',
  jwtAuth,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
  async (ctx) => {
    try {
      const { createdPlaylists, subscribedPlaylists } = await getLoggedInUserPlaylistsCombined(ctx.state.user.id)

      ctx.body = {
        createdPlaylists,
        subscribedPlaylists
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Search Public Users
router.get(
  '/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'users'),
  validateUserSearch,
  parseNSFWHeader,
  async (ctx) => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const users = await getPublicUsers(ctx.state.query)

      ctx.body = users
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Search Subscribed Public Users
router.get(
  '/subscribed',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'users'),
  validateUserSearch,
  jwtAuth,
  async (ctx) => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)

      if (ctx.state.user && ctx.state.user.id) {
        const publicUsers = await getSubscribedPublicUsers(ctx.state.query, ctx.state.user.id)
        ctx.body = publicUsers
      } else {
        throw new Error('You must be logged in to get your subscribed public users.')
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get Public User
router.get('/:id', parseNSFWHeader, async (ctx) => {
  try {
    const user = await getPublicUser(ctx.params.id)

    ctx.body = user
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Get Public User's MediaRefs
router.get(
  '/:id/mediaRefs',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'mediaRefs'),
  parseNSFWHeader,
  async (ctx) => {
    try {
      const { query } = ctx.state

      const mediaRefs = await getUserMediaRefs(query, ctx.params.id, ctx.state.includeNSFW, false)
      ctx.body = mediaRefs
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get Public User's Playlists
router.get(
  '/:id/playlists',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
  parseNSFWHeader,
  async (ctx) => {
    try {
      const { query } = ctx.state

      const playlists = await getUserPlaylists(query, ctx.params.id)
      ctx.body = playlists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

export const userRouter = router
