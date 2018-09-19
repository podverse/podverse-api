import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { delimitQueryValues } from 'utility'
import { getPodcast, getPodcasts } from 'controllers/podcast'
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
      const podcasts = await getPodcasts(ctx.request.query, ctx.state.queryPageOptions)
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

export default router
