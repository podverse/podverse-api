import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { delimitQueryValues } from 'utility'
import { getEpisode, getEpisodes } from 'controllers/episode'
import { validateEpisodeSearch } from 'middleware/validation/search'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/episode` })

const delimitKeys = ['authors', 'categories', 'mediaRefs']

// Search
router.get('/',
validateEpisodeSearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
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
      ctx.body = episode
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
