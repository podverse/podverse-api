import * as Router from 'koa-router'
import { config } from '~/config'
import {
  getSecondaryQueueEpisodesForPodcastId,
  getSecondaryQueueEpisodesForPlaylist,
  getSecondaryQueueEpisodesForPodcastId2
} from '~/controllers/secondaryQueue'
import { emitRouterError } from '~/lib/errors'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/secondary-queue` })

// Get episodes that are adjacent within a podcast
router.get('/podcast/:podcastId/episode/:episodeId', parseNSFWHeader, async (ctx) => {
  try {
    const { withFix } = ctx.query
    if (!!withFix) {
      const data = await getSecondaryQueueEpisodesForPodcastId2(ctx.params.episodeId, ctx.params.podcastId)
      ctx.body = data
    } else {
      // DEPRECATED AS OF v4.15.1 PODVERSE MOBILE
      const data = await getSecondaryQueueEpisodesForPodcastId(ctx.params.episodeId, ctx.params.podcastId)
      ctx.body = data
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Get episodes that are adjacent within a playlist
router.get('/playlist/:playlistId/episode-or-media-ref/:episodeOrMediaRef', parseNSFWHeader, async (ctx) => {
  try {
    const data = await getSecondaryQueueEpisodesForPlaylist(
      ctx.params.playlistId,
      ctx.params.episodeOrMediaRef,
      !!ctx.query.audioOnly
    )
    ctx.body = data
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const secondaryQueueRouter = router
