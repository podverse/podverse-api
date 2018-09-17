import * as Router from 'koa-router'
import { config } from 'config'
import { getEpisode, getEpisodes } from 'controllers/episode'
import { validateEpisodeSearch } from 'middleware/validation/search'

const router = new Router({ prefix: `${config.apiPrefix}/episode` })

// Search
router.get('/',
  validateEpisodeSearch,
  async ctx => {
    const episodes = await getEpisodes(ctx.request.query)
    ctx.body = episodes
  }
)

// Get
router.get('/:id',
  async ctx => {
    const episode = await getEpisode(ctx.params.id)
    ctx.body = episode
  })

export default router
