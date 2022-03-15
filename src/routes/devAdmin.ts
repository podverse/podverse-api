import * as Router from 'koa-router'
import { getConnection } from 'typeorm'
import { config } from '~/config'
import { getPodcastByPodcastIndexId } from '~/controllers/podcast'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth'
import { isDevAdmin } from '~/middleware/isDevAdmin'
import { parseFeedUrlsByPodcastIds } from '~/services/parser'
import { addOrUpdatePodcastFromPodcastIndex } from '~/services/podcastIndex'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/dev-admin` })

// Get
router.get('/parse-feed-by-podcast-id/:podcastId', jwtAuth, isDevAdmin, async (ctx) => {
  try {
    const { podcastId } = ctx.params
    await parseFeedUrlsByPodcastIds([podcastId])
    ctx.body = {
      message: 'Feed parsed successfully.'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Get
router.get('/add-or-update-feed-from-podcast-index/:podcastIndexId', jwtAuth, isDevAdmin, async (ctx) => {
  try {
    const { podcastIndexId } = ctx.params
    const connection = await getConnection()
    await addOrUpdatePodcastFromPodcastIndex(connection, podcastIndexId)

    const podcast = await getPodcastByPodcastIndexId(podcastIndexId)

    ctx.body = {
      message: 'Feed parsed successfully.',
      podcastId: podcast.id
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const devAdminRouter = router
