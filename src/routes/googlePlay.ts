import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getGooglePlayPurchase, createGooglePlayPurchase } from '~/controllers/googlePlayPurchase'
import { getLoggedInUser } from '~/controllers/user'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { validateGooglePlayPurchaseCreate } from '~/middleware/queryValidation/create'
import { GooglePlayPurchase } from '~/entities'
// import { getGoogleProductPurchase } from '~/services/google'
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
      const user = await getLoggedInUser(ctx.state.user.id)
      if (user && user.id) {
        // const body = ctx.request.body
        // TODO: !!! VERIFY THE PURCHASETOKEN !!!
        // const verified = await getGoogleApiPurchaseByToken(body.purchaseToken) as GooglePlayPurchase
        const verified = verifiedByTokenPurchase as GooglePlayPurchase
        verified.owner = user

        let purchase = await getGooglePlayPurchase(verified.orderId, user.id)

        if (purchase) {
          purchase = verified

          // TODO: IF ALREADY ACKNOWLEDGED, DO NOTHING (return already processed body)

          // const updatedPurchase = await updateGooglePlayPurchase(verified, user.id)
        } else {
          purchase = await createGooglePlayPurchase(verified)
        }

        if (purchase) {
          delete purchase.owner
        }

        if (purchase && purchase.purchaseState === 0) {

          // TODO: increase membershipExpiration by a year

          // TODO: if membership increased success, send acknowledgment to Google API

          ctx.body = {
            code: 0,
            message: 'Purchase completed.'
          }
        } else if (purchase && purchase.purchaseState === 1) {
          ctx.body = {
            code: 1,
            message: 'Purchase cancelled.',
            purchase
          }
        } else if (purchase && purchase.purchaseState === 2) {
          ctx.body = {
            code: 2,
            message: 'Purchase pending...',
            purchase
          }
        } else {
          ctx.body = {
            code: 3,
            message: 'Something went wrong while processing the purchase. Please email contact@podverse.fm for support.',
            purchase
          }
        }
      } else {
        throw new Error('User not found')
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const googlePlayRouter = router
