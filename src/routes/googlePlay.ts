import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import {
  addYearsToUserMembershipExpiration,
  createGooglePlayPurchase,
  getGooglePlayPurchase,
  getLoggedInUser,
  GooglePlayPurchase,
  updateGooglePlayPurchase
} from 'podverse-orm'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { validateGooglePlayPurchaseCreate } from '~/middleware/queryValidation/create'
import { getGoogleApiPurchaseByToken } from '~/services/google'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/google-play` })

router.use(bodyParser())

const createPurchaseLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/google-play/purchase'
})

// purchaseState
// 0 Purchased
// 1 Canceled
// 2 Pending

// Create or Update Google Play Purchases
router.post(
  '/update-purchase-status',
  validateGooglePlayPurchaseCreate,
  createPurchaseLimiter,
  jwtAuth,
  async (ctx) => {
    try {
      const body = ctx.request.body as any
      const purchaseToken = body.purchaseToken
      const productId = body.productId
      const user = await getLoggedInUser(ctx.state.user.id)
      if (!user || !user.id) {
        throw new Error('User not found')
      } else {
        const verified = (await getGoogleApiPurchaseByToken(productId, purchaseToken)) as any
        verified.owner = user
        verified.purchaseToken = purchaseToken
        verified.productId = productId
        verified.transactionId = verified.orderId
        delete verified.orderId

        let purchase = (await getGooglePlayPurchase(verified.transactionId, user.id)) as GooglePlayPurchase

        if (purchase) {
          purchase = verified
          if (purchase.consumptionState === 1) {
            ctx.body = {
              code: 4,
              message: 'Purchase already completed.'
            }
            return
          }
        } else {
          purchase = await createGooglePlayPurchase(verified)
        }

        if (purchase && purchase.purchaseState === 0) {
          await addYearsToUserMembershipExpiration(user.id, 1)
          await updateGooglePlayPurchase(
            {
              ...purchase,
              consumptionState: 1
            },
            user.id
          )
          ctx.body = {
            code: 0,
            message: 'Purchase completed successfully.'
          }
        } else if (purchase && purchase.purchaseState === 1) {
          ctx.body = {
            code: 1,
            message: 'Purchase cancelled.'
          }
        } else if (purchase && purchase.purchaseState === 2) {
          ctx.body = {
            code: 2,
            message: 'Purchase pending...'
          }
        } else {
          ctx.body = {
            code: 3,
            message: 'Something went wrong while processing this purchase. Please email contact@podverse.fm for help.'
          }
        }
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

export const googlePlayRouter = router
