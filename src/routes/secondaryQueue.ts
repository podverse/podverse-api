import * as Router from 'koa-router'
import { config } from '~/config'
import { getSecondaryQueueEpisodesForPodcastId } from '~/controllers/secondaryQueue'
import { emitRouterError } from '~/lib/errors'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/secondary-queue` })

// Get episodes that are adjacent to a podcast
router.get('/episode/:episodeId/podcast/:podcastId', parseNSFWHeader, async (ctx) => {
  try {
    const data = await getSecondaryQueueEpisodesForPodcastId(ctx.params.episodeId, ctx.params.podcastId)
    ctx.body = data
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const secondaryQueueRouter = router
