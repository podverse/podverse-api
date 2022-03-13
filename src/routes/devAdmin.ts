import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth'
import { isDevAdmin } from '~/middleware/isDevAdmin'
import { parseFeedUrlsByPodcastIds } from '~/services/parser'

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

export const devAdminRouter = router
