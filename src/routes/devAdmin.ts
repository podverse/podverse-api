import * as Router from 'koa-router'
import { getConnection, getPodcastByPodcastIndexId } from 'podverse-orm'
import { config } from '~/config'
import { parserInstance } from '~/factories/parser'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth'
import { isDevAdmin } from '~/middleware/isDevAdmin'
import { addOrUpdatePodcastFromPodcastIndex } from '~/services/podcastIndex'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/dev-admin` })

// Get
router.get('/parse-feed-by-podcast-id/:podcastId', jwtAuth, isDevAdmin, async (ctx) => {
  try {
    const { podcastId } = ctx.params
    await parserInstance.parseFeedUrlsByPodcastIds([podcastId])
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
    const allowNonPublic = true
    const podcast = await getPodcastByPodcastIndexId(podcastIndexId, allowNonPublic)

    ctx.body = {
      message: 'Feed parsed successfully.',
      podcastId: podcast.id
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const devAdminRouter = router
