import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { getEpisode, getEpisodes } from 'controllers/episode'
import { validateEpisodeSearch } from 'middleware/validation/search'
const createError = require('http-errors')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/episode` })

// Search
router.get('/',
  validateEpisodeSearch,
  async ctx => {
    try {
      const episodes = await getEpisodes(ctx.request.query)
      ctx.body = episodes
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get
router.get('/:id',
  async ctx => {
    try {
      const episode = await getEpisode(ctx.params.id)
      if (!episode) {
        throw new createError.NotFound()
      }
      ctx.body = episode
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
