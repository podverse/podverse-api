import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { getCategory, getCategories } from 'controllers/category'
import { validateCategorySearch } from 'middleware/validation/search'
const createError = require('http-errors')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/category` })

// Search
router.get('/',
  validateCategorySearch,
  async ctx => {
    try {
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
