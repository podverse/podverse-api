import * as Router from 'koa-router'
import { config } from '~/config'
import { findPodcastsByFeedUrls, getMetadata, getPodcast, getPodcastByPodcastIndexId, getPodcasts, getPodcastsFromSearchEngine,
  getSubscribedPodcasts, toggleSubscribeToPodcast } from '~/controllers/podcast'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validatePodcastSearch } from '~/middleware/queryValidation/search'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/podcast` })

const delimitKeys = ['authors', 'categories', 'episodes', 'feedUrls']

// Get only the podcasts most recent metadata to determine if new episodes are available
router.get('/metadata',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'podcasts'),
  validatePodcastSearch,
  parseNSFWHeader,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const podcasts = await getMetadata(ctx.state.query)

      ctx.body = podcasts
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Search
router.get('/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'podcasts'),
  validatePodcastSearch,
  parseNSFWHeader,
  async ctx => {
    try {
      const { query = {} } = ctx.state
      ctx = delimitQueryValues(ctx, delimitKeys)

      let podcasts
      if (query.searchTitle) {
        podcasts = await getPodcastsFromSearchEngine(query)
      } else {
        podcasts = await getPodcasts(query)
      }

      ctx.body = podcasts
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Search Subscribed Podcasts
router.get('/subscribed',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'podcasts'),
  validatePodcastSearch,
  jwtAuth,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)

      if (ctx.state.user && ctx.state.user.id) {
        const podcasts = await getSubscribedPodcasts(ctx.state.query, ctx.state.user.id)
        ctx.body = podcasts
      } else {
        throw new Error('You must be logged in to get your subscribed podcasts.')
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get by Podcast Index ID
router.get('/podcastindex/:id',
  parseNSFWHeader,
  async ctx => {
    try {
      const podcast = await getPodcastByPodcastIndexId(ctx.params.id)
      ctx.body = podcast
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

// Find Podcasts by FeedUrls
router.post('/find-by-feed-urls',
  parseNSFWHeader,
  async ctx => {
    try {
      const body: any = ctx.request.body
      const results = await findPodcastsByFeedUrls(body.feedUrls)
      ctx.body = results
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Toggle subscribe to podcast
const toggleSubscribeLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 15,
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
