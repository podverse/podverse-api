import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import { getEpisode, getEpisodes } from '~/controllers/episode'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateEpisodeSearch } from '~/middleware/queryValidation/search'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader';
import { sfwFilterEpisodes } from '~/lib/profanityFilter';

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/episode` })

const delimitKeys = ['authors', 'categories', 'mediaRefs']

// Search
router.get('/',
  parseNSFWHeader,
  parseQueryPageOptions,
  validateEpisodeSearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const episodes = await getEpisodes(ctx.request.query, ctx.state.includeNSFW)

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

export const episodeRouter = router
