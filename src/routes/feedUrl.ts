import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getFeedUrl } from '~/controllers/feedUrl'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/feedUrl` })

// Get
router.get('/:id', async (ctx) => {
  try {
    const feedUrl = await getFeedUrl(ctx.params.id)
    ctx.body = feedUrl
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const feedUrlRouter = router
