import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { convertToChaptersFile } from '~/lib/podcastIndex'
import { getPublicMediaRefsByEpisodeGuid } from '~/controllers/mediaRef'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
const json = require('koa-json')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/clips` })

router.use(bodyParser())

// Get public mediaRefs by episode guid
router.get('/', parseNSFWHeader, json(), async (ctx) => {
  try {
    const { episodeGuid, podcastId } = ctx.query
    const mediaRefsResult = await getPublicMediaRefsByEpisodeGuid(episodeGuid, podcastId)
    const mediaRefs = mediaRefsResult[0]
    const chaptersFile = convertToChaptersFile(mediaRefs)
    const prettyChaptersFileString = JSON.stringify(chaptersFile, null, 4)
    ctx.body = JSON.parse(prettyChaptersFileString)
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const clipsRouter = router
