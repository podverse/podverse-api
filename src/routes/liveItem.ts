import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getLiveItems } from '~/controllers/liveItem'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateLiveItemSearch } from '~/middleware/queryValidation/search'
import { delimitQueryValues } from '~/lib/utility'
import {
  getEpisodes,
  getEpisodesByCategoryIds,
  getEpisodesByPodcastIds,
  getEpisodesFromSearchEngine
} from '~/controllers/episode'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/liveItem` })

const delimitKeys = ['authors', 'mediaRefs']

// Search
router.get(
  '/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'liveItems'),
  validateLiveItemSearch,
  async (ctx) => {
    try {
      const { query = {} } = ctx.state
      ctx = delimitQueryValues(ctx, delimitKeys)

      query.sort = query.liveItemStatus === 'pending' ? 'live-item-start-asc' : 'live-item-start-desc'

      let episodes

      if (query.podcastId && query.searchTitle) {
        episodes = await getEpisodesByPodcastIds(query)
      } else if (query.searchTitle) {
        episodes = await getEpisodesFromSearchEngine(query)
      } else if (query.categories) {
        episodes = await getEpisodesByCategoryIds(query)
      } else if (query.podcastId) {
        episodes = await getEpisodesByPodcastIds(query)
      } else {
        episodes = await getEpisodes(query)
      }

      ctx.body = episodes
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

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
