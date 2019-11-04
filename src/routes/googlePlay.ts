import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { getGooglePlayPurchase, createGooglePlayPurchase } from '~/controllers/googlePlayPurchase'
import { addYearsToUserMembershipExpiration, getLoggedInUser } from '~/controllers/user'
import { GooglePlayPurchase } from '~/entities'
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

const verifiedByTokenPurchase = {
}

// purchaseState
// 0 Purchased
// 1 Canceled
// 2 Pending

// Create or Update Google Play Purchases
router.post('/update-purchase-status',
  validateGooglePlayPurchaseCreate,
  createPurchaseLimiter,
  jwtAuth,
  async ctx => {
    try {
      // @ts-ignore
      const purchaseToken = ctx.request.body.purchaseToken
      // @ts-ignore
      const productId = ctx.request.body.productId
      const user = await getLoggedInUser(ctx.state.user.id)
      if (!user || !user.id) {
        throw new Error('User not found')
      } else {

        // TODO: !!! VERIFY THE PURCHASETOKEN !!! (200)
        // TODO: test/handle passing invalid token to google (400)
        // TODO: test/handle google play api is down, or other error (5xx)
        const verified = await getGoogleApiPurchaseByToken(productId, purchaseToken) as GooglePlayPurchase

        // @ts-ignore
        // const verified = verifiedByTokenPurchase as GooglePlayPurchase
        verified.owner = user
        verified.purchaseToken = purchaseToken
        verified.productId = productId

        let purchase = await getGooglePlayPurchase(verified.orderId, user.id)

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
            message: 'Something went wrong while processing the purchase. Please email contact@podverse.fm for support.'
          }
        }
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const googlePlayRouter = router
