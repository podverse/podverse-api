import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { getAuthor, getAuthors } from 'controllers/author'
import { parseQueryPageOptions } from 'middleware/parseQueryPageOptions'
import { validateAuthorSearch } from 'middleware/validation/search'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/author` })

// Search
router.get('/',
  parseQueryPageOptions,
  validateAuthorSearch,
  async ctx => {
    try {
      const authors = await getAuthors(ctx.request.query, ctx.state.queryPageOptions)
      ctx.body = authors
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get
router.get('/:id',
  async ctx => {
    try {
      const author = await getAuthor(ctx.params.id)
      ctx.body = author
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
