import * as Router from 'koa-router'
import { config } from 'config'
import { getCategory, getCategories } from 'controllers/category'
import { validateCategorySearch } from 'middleware/validation/search'

const router = new Router({ prefix: `${config.apiPrefix}/category` })

// Search
router.get('/',
  validateCategorySearch,
  async ctx => {
    const categories = await getCategories(ctx.request.query)
    ctx.body = categories
  }
)

// Get
router.get('/:id',
  async ctx => {
    const category = await getCategory(ctx.params.id)
    ctx.body = category
  })

export default router
