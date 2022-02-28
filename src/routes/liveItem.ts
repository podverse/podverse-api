import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getLiveItems } from '~/controllers/liveItem'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/liveItem` })

// Get
router.get('/podcast/:podcastId', async (ctx) => {
  try {
    const liveItems = await getLiveItems(ctx.params.podcastId)
    ctx.body = liveItems
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const liveItemRouter = router
