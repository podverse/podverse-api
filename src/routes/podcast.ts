import * as Router from 'koa-router'
import { config } from '~/config'
import { getPodcast, getPodcasts, toggleSubscribeToPodcast } from '~/controllers/podcast'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validatePodcastSearch } from '~/middleware/queryValidation/search'
const RateLimit = require('koa2-ratelimit').RateLimit

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/podcast` })

const delimitKeys = ['authors', 'categories', 'episodes', 'feedUrls']

// Search
router.get('/',
  validatePodcastSearch,
  parseNSFWHeader,
  (ctx, next) => parseQueryPageOptions(ctx, next, 'podcasts'),
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const podcasts = await getPodcasts(ctx.request.query, ctx.state.includeNSFW)

      ctx.body = podcasts
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get
router.get('/:id',
  parseNSFWHeader,
  async ctx => {
    try {
      const podcast = await getPodcast(ctx.params.id)

      ctx.body = podcast
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Toggle subscribe to podcast
const toggleSubscribeLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: 15,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'get/toggle-subscribe'
})

router.get('/toggle-subscribe/:id',
  toggleSubscribeLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const subscribedPodcastIds = await toggleSubscribeToPodcast(ctx.params.id, ctx.state.user.id)
      ctx.body = subscribedPodcastIds
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const podcastRouter = router
