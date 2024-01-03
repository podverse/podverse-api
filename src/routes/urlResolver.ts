import * as Router from 'koa-router'
import { getEpisodeWebUrl, getPodcastWebUrl } from 'podverse-orm'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { validateUrlResolverEpisode, validateUrlResolverPodcast } from '~/middleware/queryValidation/urlResolver'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/url-resolver` })

type UrlResolverPodcastQueryParams = {
  podcastGuid?: string
  podcastIndexId?: string
}

router.get('/podcast', validateUrlResolverPodcast, async (ctx) => {
  try {
    const { podcastGuid, podcastIndexId } = ctx.request.query as UrlResolverPodcastQueryParams
    const body = await getPodcastWebUrl({ podcastGuid, podcastIndexId })
    ctx.body = body
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

type UrlResolverEpisodeQueryParams = {
  podcastGuid?: string
  podcastIndexId?: string
  episodeGuid?: string
}

router.get('/episode', validateUrlResolverEpisode, async (ctx) => {
  try {
    const { podcastGuid, podcastIndexId, episodeGuid } = ctx.request.query as UrlResolverEpisodeQueryParams
    const body = await getEpisodeWebUrl({ podcastGuid, podcastIndexId, episodeGuid })
    ctx.body = body
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const urlResolverRouter = router
