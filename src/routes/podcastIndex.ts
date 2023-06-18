import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getPodcastFromPodcastIndexById, getValueTagForItemFromPodcastIndexByGuids } from '~/services/podcastIndex'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/podcast-index` })

const podcastByIdLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 100,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'get/podcast-index/by-id'
})

// Get podcast from Podcast Index by feed id
router.get('/podcast/by-id/:id', podcastByIdLimiter, async (ctx) => {
  try {
    const data = await getPodcastFromPodcastIndexById(ctx.params.id)
    ctx.body = data
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Get value tags from Podcast Index by feed and item guids.
router.get('/value/podcast-guid/:podcastGuid/episode-guid/:episodeGuid', async (ctx) => {
  try {
    const data = await getValueTagForItemFromPodcastIndexByGuids(ctx.params.podcastGuid, ctx.params.episodeGuid)
    ctx.body = data
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const podcastIndexRouter = router
