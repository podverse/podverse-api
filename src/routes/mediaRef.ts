import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import {
  createMediaRef,
  deleteMediaRef,
  getMediaRef,
  getMediaRefs,
  getMediaRefsFromSearchEngine,
  updateMediaRef
} from 'podverse-orm'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateMediaRefCreate } from '~/middleware/queryValidation/create'
import { validateMediaRefSearch } from '~/middleware/queryValidation/search'
import { validateMediaRefUpdate } from '~/middleware/queryValidation/update'
import { hasValidMembership } from '~/middleware/hasValidMembership'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const delimitKeys = ['authors']

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/mediaRef` })

router.use(bodyParser())

// Search
router.get(
  '/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'mediaRefs'),
  validateMediaRefSearch,
  parseNSFWHeader,
  async (ctx) => {
    try {
      const { includeNSFW, query } = ctx.state
      ctx = delimitQueryValues(ctx, delimitKeys)
      let mediaRefs = [[], 0]

      if (query.podcastId && query.searchTitle) {
        mediaRefs = await getMediaRefs(query, includeNSFW)
      } else if (query.searchTitle) {
        mediaRefs = await getMediaRefsFromSearchEngine(query)
      } else {
        mediaRefs = await getMediaRefs(query, includeNSFW)
      }

      ctx.body = mediaRefs
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get
router.get('/:id', parseNSFWHeader, async (ctx) => {
  try {
    const mediaRef = await getMediaRef(ctx.params.id)

    ctx.body = mediaRef
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Create
const createMediaRefLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 6,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/mediaRef'
})

router.post('/', validateMediaRefCreate, jwtAuth, hasValidMembership, createMediaRefLimiter, async (ctx) => {
  try {
    const body: any = ctx.request.body

    if (ctx.state.user && ctx.state.user.id) {
      body.owner = ctx.state.user.id
    } else {
      throw new Error('You must be logged in to create clips.')
    }

    const mediaRef = await createMediaRef(body)
    ctx.body = mediaRef
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Update
const updateMediaRefLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 6,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/mediaRef'
})

router.patch('/', validateMediaRefUpdate, jwtAuth, updateMediaRefLimiter, async (ctx) => {
  try {
    const body = ctx.request.body
    const mediaRef = await updateMediaRef(body, ctx.state.user.id)
    ctx.body = mediaRef
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Delete
router.delete('/:id', jwtAuth, async (ctx) => {
  try {
    await deleteMediaRef(ctx.params.id, ctx.state.user.id)
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const mediaRefRouter = router
