import * as Router from 'koa-router'
import { getPodcast, getPodcasts } from 'controllers/podcast'
import { validatePodcastQuery } from 'middleware/validateQuery'

const router = new Router({ prefix: '/podcast' })

// Search
router.get('/',
  validatePodcastQuery,
  async ctx => {
    const podcasts = await getPodcasts(ctx.request.query)
    ctx.body = podcasts
  }
)

// Get
router.get('/:id', async ctx => {
  const podcast = await getPodcast(ctx.params.id)
  ctx.body = podcast
})

export default router
