import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { delimitQueryValues } from 'utility'
import { getAuthor, getAuthors } from 'controllers/author'
import { validateAuthorSearch } from 'middleware/validation/search'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/author` })

const delimitKeys = ['episodes', 'mediaRefs', 'podcasts']

// Search
router.get('/',
  validateAuthorSearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const authors = await getAuthors(ctx.request.query)
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
