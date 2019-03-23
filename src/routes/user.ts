import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getPublicUser, getPublicUsers, getUserMediaRefs, getUserPlaylists,
  toggleSubscribeToUser } from '~/controllers/user'
import { delimitQueryValues } from '~/lib/utility'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { validateUserSearch } from '~/middleware/queryValidation/search'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const delimitKeys = []

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user` })

router.use(bodyParser())

// Search Public Users
router.get('/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'users'),
  validateUserSearch,
  parseNSFWHeader,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const users = await getPublicUsers(ctx.state.query)

      ctx.body = users
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Public User
router.get('/:id',
  parseNSFWHeader,
  async ctx => {
    try {
      const user = await getPublicUser(ctx.params.id)

      ctx.body = user
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Public User's MediaRefs
router.get('/:id/mediaRefs',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'mediaRefs'),
  parseNSFWHeader,
  async ctx => {
    try {
      const { query } = ctx.request

      const mediaRefs = await getUserMediaRefs(
        ctx.params.id,
        ctx.state.includeNSFW,
        false,
        query.sort,
        query.skip,
        query.take
      )
      ctx.body = mediaRefs
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get Public User's Playlists
router.get('/:id/playlists',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
  parseNSFWHeader,
  async ctx => {
    try {
      const { query } = ctx.request

      const playlists = await getUserPlaylists(
        ctx.params.id,
        false,
        query.skip,
        query.take
      )
      ctx.body = playlists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Toggle subscribe to user
const toggleSubscribeUserLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'get/toggle-subscribe'
})

router.get('/toggle-subscribe/:id',
  toggleSubscribeUserLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const subscribedUserIds = await toggleSubscribeToUser(ctx.params.id, ctx.state.user.id)
      ctx.body = subscribedUserIds
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const userRouter = router
