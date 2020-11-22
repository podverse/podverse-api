import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getPublicMediaRefsByEpisodeMediaUrl } from '~/controllers/mediaRef'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/clips` })

router.use(bodyParser())

// Get public mediaRefs by episode mediaUrl
router.get('/',
  parseNSFWHeader,
  async ctx => {
    try {
      const { mediaUrl } = ctx.query
      const mediaRefsResult = await getPublicMediaRefsByEpisodeMediaUrl(mediaUrl)
      ctx.body = mediaRefsResult
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const clipsRouter = router
