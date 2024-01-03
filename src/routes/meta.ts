import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/meta` })

// Minimum mobile version
router.get('/min-mobile-version', async (ctx) => {
  const { minimumMobileVersion } = config
  try {
    ctx.body = {
      version: minimumMobileVersion
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

router.get('/app-info', async (ctx) => {
  const { minimumMobileVersion, maintenanceMode } = config
  try {
    ctx.body = {
      version: minimumMobileVersion,
      maintenanceScheduled: {
        endTime: maintenanceMode?.scheduled?.endTime,
        startTime: maintenanceMode?.scheduled?.startTime
      }
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const metaRouter = router
