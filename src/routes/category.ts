import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import { getCategory, getCategories } from '~/controllers/category'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateCategorySearch } from '~/middleware/queryValidation/search'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/category` })

const delimitKeys = ['categories']

// Search
router.get('/',
  parseQueryPageOptions,
  validateCategorySearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const categories = await getCategories(ctx.request.query, ctx.state.queryPageOptions)
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

export const categoryRouter = router
