import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { getFeedUrl, getFeedUrls } from 'controllers/feedUrl'
import { validateFeedUrlSearch } from 'middleware/validation/search'
const createError = require('http-errors')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/feedUrl` })

// Search
router.get('/',
  validateFeedUrlSearch,
  async ctx => {
    try {
      const feedUrls = await getFeedUrls(ctx.request.query)
      ctx.body = feedUrls
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get
router.get('/:id',
  async ctx => {
    try {
      const feedUrl = await getFeedUrl(ctx.params.id)
      ctx.body = feedUrl
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
