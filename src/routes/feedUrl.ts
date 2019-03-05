import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getFeedUrl, getFeedUrls } from '~/controllers/feedUrl'
// import { isSuperUser } from '~/middleware/isSuperUser'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
// import { validateFeedUrlCreate } from '~/middleware/queryValidation/create'
import { validateFeedUrlSearch } from '~/middleware/queryValidation/search'
// import { validateFeedUrlUpdate } from '~/middleware/queryValidation/update'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/feedUrl` })

// Search
router.get('/',
  validateFeedUrlSearch,
  parseQueryPageOptions,
  async ctx => {
    try {
      const feedUrls = await getFeedUrls(ctx.request.query, ctx.state.queryPageOptions)
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

// // Create
// router.post('/',
//   validateFeedUrlCreate,
//   isSuperUser,
//   async ctx => {
//     try {
//       let body: any = ctx.request.body

//       const mediaRef = await addFeedUrls([body])
//       ctx.body = mediaRef
//     } catch (error) {
//       emitRouterError(error, ctx)
//     }
//   })

// // Update
// router.patch('/',
//   validateFeedUrlUpdate,
//   isSuperUser,
//   async ctx => {
//     try {
//       const body = ctx.request.body
//       const feedUrl = await updateFeedUrl(body)
//       ctx.body = feedUrl
//     } catch (error) {
//       emitRouterError(error, ctx)
//     }
//   })

export const feedUrlRouter = router
