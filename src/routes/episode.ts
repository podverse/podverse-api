import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import { getEpisode, getEpisodes, retrieveLatestChapters } from '~/controllers/episode'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateEpisodeSearch } from '~/middleware/queryValidation/search'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/episode` })

const delimitKeys = ['authors', 'mediaRefs']

// Search
router.get('/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'episodes'),
  validateEpisodeSearch,
  parseNSFWHeader,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)

      const { query } = ctx.request
      query.take = config.queryEpisodesLimit
      if (query.page > 1) {
        query.skip = (((parseInt(query.page, 10) - 1) * query.take))
      }
      const episodes = await getEpisodes(ctx.state.query, ctx.state.includeNSFW)

      ctx.body = episodes
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get
router.get('/:id',
  parseNSFWHeader,
  async ctx => {
    try {
      const episode = await getEpisode(ctx.params.id)

      ctx.body = episode
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

router.get('/:id/retrieve-latest-chapters',
  async ctx => {
    try {
      if (!ctx.params.id) throw new Error('An episodeId is required.')
      const latestChapters = await retrieveLatestChapters(ctx.params.id)
      ctx.body = latestChapters
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const episodeRouter = router
