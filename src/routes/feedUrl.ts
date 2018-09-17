import * as Router from 'koa-router'
import { config } from 'config'
import { getFeedUrl, getFeedUrls } from 'controllers/feedUrl'
import { validateFeedUrlSearch } from 'middleware/validation/search'

const router = new Router({ prefix: `${config.apiPrefix}/feedUrl` })

// Search
router.get('/',
  validateFeedUrlSearch,
  async ctx => {
    const feedUrls = await getFeedUrls(ctx.request.query)
    ctx.body = feedUrls
  }
)

// Get
router.get('/:id',
  async ctx => {
    const feedUrl = await getFeedUrl(ctx.params.id)
    ctx.body = feedUrl
  })

export default router
