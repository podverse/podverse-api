import * as Router from 'koa-router'
import { config } from '~/config'
import {
  getSecondaryQueueEpisodesForPodcastId,
  getSecondaryQueueEpisodesForPlaylist
} from '~/controllers/secondaryQueue'
import { emitRouterError } from '~/lib/errors'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/secondary-queue` })

/* TODO: REMOVE THIS AFTER NEXT BETA RELEASE */
// Get episodes that are adjacent within a podcast
router.get('/episode/:episodeId/podcast/:podcastId', parseNSFWHeader, async (ctx) => {
  try {
    const data = await getSecondaryQueueEpisodesForPodcastId(ctx.params.episodeId, ctx.params.podcastId)
    ctx.body = data
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Get episodes that are adjacent within a podcast
router.get('/podcast/:podcastId/episode/:episodeId', parseNSFWHeader, async (ctx) => {
  try {
    const data = await getSecondaryQueueEpisodesForPodcastId(ctx.params.episodeId, ctx.params.podcastId)
    ctx.body = data
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
