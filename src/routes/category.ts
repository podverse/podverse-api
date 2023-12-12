import * as Router from 'koa-router'
import { getCategory, getCategories } from 'podverse-orm'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateCategorySearch } from '~/middleware/queryValidation/search'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/category` })

const delimitKeys = ['categories']

// Search
router.get(
  '/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'categories'),
  validateCategorySearch,
  async (ctx) => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const categories = await getCategories(ctx.state.query)
      ctx.body = categories
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get
router.get('/:id', async (ctx) => {
  try {
    const category = await getCategory(ctx.params.id)
    ctx.body = category
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const categoryRouter = router
