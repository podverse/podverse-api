import * as Router from 'koa-router'
import { getCategory, getCategories } from 'controllers/category'
import { validateCategoryQuery } from 'middleware/validateQuery'

const router = new Router({ prefix: '/category' })

// Search
router.get('/',
  validateCategoryQuery,
  async ctx => {
    const categories = await getCategories(ctx.request.query)
    ctx.body = categories
  }
)

// Get
router.get('/:id', async ctx => {
  const category = await getCategory(ctx.params.id)
  ctx.body = category
})

export default router
