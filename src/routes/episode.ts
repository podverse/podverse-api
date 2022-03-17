import * as Router from 'koa-router'
import type { SocialInteraction } from 'podverse-shared'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import {
  getEpisode,
  getEpisodes,
  getEpisodesByCategoryIds,
  getEpisodesByPodcastIds,
  getEpisodesFromSearchEngine,
  retrieveLatestChapters
} from '~/controllers/episode'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateEpisodeSearch } from '~/middleware/queryValidation/search'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { getThreadcap } from '~/services/socialInteraction/threadcap'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/episode` })

const delimitKeys = ['authors', 'mediaRefs']

// Search
router.get(
  '/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'episodes'),
  validateEpisodeSearch,
  parseNSFWHeader,
  async (ctx) => {
    try {
      const { query = {} } = ctx.state
      ctx = delimitQueryValues(ctx, delimitKeys)

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
router.get('/:id', parseNSFWHeader, async (ctx) => {
  try {
    const episode = await getEpisode(ctx.params.id)

    ctx.body = episode
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

router.get('/:id/retrieve-latest-chapters', async (ctx) => {
  try {
    if (!ctx.params.id) throw new Error('An episodeId is required.')
    const latestChapters = await retrieveLatestChapters(ctx.params.id)
    ctx.body = latestChapters
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

router.get('/:id/proxy/activity-pub', async (ctx) => {
  try {
    if (!ctx.params.id) throw new Error('An episodeId is required.')
    const episode = await getEpisode(ctx.params.id)
    if (!episode) {
      throw new Error('No episode found with that id.')
    }
    if (!episode.socialInteraction || episode.socialInteraction.length === 0) {
      throw new Error('No socialInteraction value found for episode.')
    }
    const activityPub = episode.socialInteraction.find(
      (item: SocialInteraction) =>
        item.protocol === 'activitypub' ||
        item.platform === 'activitypub' ||
        item.platform === 'castopod' ||
        item.platform === 'mastodon' ||
        item.platform === 'peertube'
    )
    if (!activityPub || !activityPub.url) {
      throw new Error('No activityPub url found for episode.')
    }

    const protocol = 'activitypub'
    const body = await getThreadcap(activityPub.url, protocol)
    ctx.body = body
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

router.get('/:id/proxy/twitter', async (ctx) => {
  try {
    if (!ctx.params.id) throw new Error('An episodeId is required.')
    const episode = await getEpisode(ctx.params.id)
    if (!episode) {
      throw new Error('No episode found with that id.')
    }
    if (!episode.socialInteraction || episode.socialInteraction.length === 0) {
      throw new Error('No socialInteraction value found for episode.')
    }

    const twitter = episode.socialInteraction.find(
      (item: SocialInteraction) => item.protocol === 'twitter' || item.platform === 'twitter'
    )

    if (!twitter || !twitter.url) {
      throw new Error('No twitter url found for episode.')
    }

    console.log('config.twitterAPIBearerToken', config.twitterAPIBearerToken, process.env.TWITTER_API_BEARER_TOKEN)

    const protocol = 'twitter'
    const body = await getThreadcap(twitter.url, protocol, config.twitterAPIBearerToken)
    ctx.body = body
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const episodeRouter = router
