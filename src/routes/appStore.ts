import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { getLoggedInUser } from 'podverse-orm'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { validateAppStorePurchaseCreate } from '~/middleware/queryValidation/create'
import {
  processAppStorePurchases,
  processAppStorePurchases2,
  verifyAppStorePurchaseByReceipt
} from '~/services/appStore'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/app-store` })

router.use(bodyParser())

const createPurchaseLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/app-store/purchase'
})

// DEPRECATED as of 4.14.2, after we upgraded react-native-iap to v10.1.2.
// Create or Update App Store Purchases
router.post('/update-purchase-status', validateAppStorePurchaseCreate, createPurchaseLimiter, jwtAuth, async (ctx) => {
  try {
    const { transactionReceipt } = ctx.request.body as any
    const user = await getLoggedInUser(ctx.state.user.id)
    if (!user || !user.id) {
      throw new Error('User not found')
    } else {
      const receipt = (await verifyAppStorePurchaseByReceipt(transactionReceipt)) as any

      if (receipt) {
        const { in_app } = receipt
        const finishedTransactionIds = await processAppStorePurchases(in_app, user.id)

        ctx.status = 200
        ctx.body = {
          finishedTransactionIds
        }
      } else {
        throw new Error('Receipt not found')
      }
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Create or Update App Store Purchases
// Used in podverse-rn v4.14.2+
router.post(
  '/update-purchase-status-2',
  validateAppStorePurchaseCreate,
  createPurchaseLimiter,
  jwtAuth,
  async (ctx) => {
    try {
      const { transactionReceipt } = ctx.request.body as any
      const user = await getLoggedInUser(ctx.state.user.id)
      if (!user || !user.id) {
        throw new Error('User not found')
      } else {
        const receipt = (await verifyAppStorePurchaseByReceipt(transactionReceipt)) as any

        if (receipt) {
          const { in_app } = receipt
          const processedPurchases = await processAppStorePurchases2(in_app, user.id)

          ctx.status = 200
          ctx.body = {
            processedPurchases
          }
        } else {
          throw new Error('Receipt not found')
        }
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

export const appStoreRouter = router
