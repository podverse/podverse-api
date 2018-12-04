import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { delimitQueryValues } from 'lib/utility'
import { getPodcast, getPodcasts, toggleSubscribeToPodcast } from 'controllers/podcast'
import { jwtAuth } from 'middleware/auth/jwtAuth'
import { parseQueryPageOptions } from 'middleware/parseQueryPageOptions'
import { validatePodcastSearch } from 'middleware/validation/search'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/podcast` })

const delimitKeys = ['authors', 'categories', 'episodes', 'feedUrls']

// Search
router.get('/',
  parseQueryPageOptions,
  validatePodcastSearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const podcasts = await getPodcasts(ctx.request.query)
      ctx.body = podcasts
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get
router.get('/:id',
  async ctx => {
    try {
      const podcast = await getPodcast(ctx.params.id)
      ctx.body = podcast
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Toggle subscribe to podcast
router.get('/toggle-subscribe/:id',
  jwtAuth,
  async ctx => {
    try {
      const subscribedPodcastIds = await toggleSubscribeToPodcast(ctx.params.id, ctx.state.user.id)
      ctx.body = subscribedPodcastIds
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
