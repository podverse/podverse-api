import * as Router from 'koa-router'
import { getEpisode, getEpisodes } from 'controllers/episode'
import { validateEpisodeQuery } from 'middleware/validateQuery'

const router = new Router({ prefix: '/episode' })

// Search
router.get('/',
  validateEpisodeQuery,
  async ctx => {
    const episodes = await getEpisodes(ctx.request.query)
    ctx.body = episodes
  }
)

// Get
router.get('/:id', async ctx => {
  const episode = await getEpisode(ctx.params.id)
  ctx.body = episode
})

export default router
