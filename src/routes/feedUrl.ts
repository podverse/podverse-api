import * as Router from 'koa-router'
import { getFeedUrl, getFeedUrls } from 'controllers/feedUrl'
import { validateFeedUrlQuery } from './validation/query'

const router = new Router({ prefix: '/feedUrl' })

// Search
router.get('/',
  validateFeedUrlQuery,
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
