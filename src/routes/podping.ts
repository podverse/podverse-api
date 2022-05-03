import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth'
import { isPodpingAdmin } from '~/middleware/isPodpingAdmin'
const { dockerCommand } = require('docker-cli-js')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/podping` })
router.use(bodyParser())

type FeedLiveUpdateBody = {
  feedUrl: string
}

// Post a liveItem status update notification to PodPing
router.post('/feed/live-update', jwtAuth, isPodpingAdmin, async (ctx) => {
  try {
    const body = ctx.request.body as FeedLiveUpdateBody
    const { feedUrl } = body
    const validatedUrl = new URL(feedUrl)

    if (validatedUrl.protocol != 'http:' && validatedUrl.protocol !== 'https:') {
      throw new Error('Invalid feed url provided.')
    }

    const options = {
      machineName: undefined, // uses local docker
      currentWorkingDirectory: undefined, // uses current working directory
      echo: true, // echo command output to stdout/stderr
      env: undefined,
      stdin: undefined
    }

    await dockerCommand(
      `run --rm -e PODPING_HIVE_ACCOUNT=${config.podping.hiveAccount} -e PODPING_HIVE_POSTING_KEY=${config.podping.hivePostingKey} docker.io/podcastindexorg/podping-hivewriter --ignore-config-updates --reason live write ${validatedUrl}`,
      options
    )

    ctx.body = {
      message: 'Podping live update notification sent!'
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const podpingRouter = router
