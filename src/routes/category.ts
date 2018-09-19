import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { delimitQueryValues } from 'utility'
import { getCategory, getCategories } from 'controllers/category'
import { validateCategorySearch } from 'middleware/validation/search'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/category` })

const delimitKeys = ['categories']

// Search
router.get('/',
validateCategorySearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const categories = await getCategories(ctx.request.query)
      ctx.body = categories
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get
router.get('/:id',
  async ctx => {
    try {
      const category = await getCategory(ctx.params.id)
      ctx.body = category
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
