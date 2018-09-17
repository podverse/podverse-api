import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { getPodcast, getPodcasts } from 'controllers/podcast'
import { validatePodcastSearch } from 'middleware/validation/search'
const createError = require('http-errors')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/podcast` })

// Search
router.get('/',
  validatePodcastSearch,
  async ctx => {
    try {
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
      if (!podcast) {
        throw new createError.NotFound()
      }
      ctx.body = podcast
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
