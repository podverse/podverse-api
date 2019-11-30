import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { getLoggedInUser } from '~/controllers/user'
import { AppStorePurchase } from '~/entities'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { validateAppStorePurchaseCreate } from '~/middleware/queryValidation/create'
import { verifyAppStorePurchaseByReceipt } from '~/services/apple'
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

// const verifiedByTokenPurchase = {
// }

// status
// 0 Purchased
// Other error codes found in Table 2-1 in the page linked below:
// https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html

// Create or Update App Store Purchases
router.post('/update-purchase-status',
  validateAppStorePurchaseCreate,
  createPurchaseLimiter,
  jwtAuth,
  async ctx => {
    try {
      // @ts-ignore
      const { transactionReceipt } = ctx.request.body
      const user = await getLoggedInUser(ctx.state.user.id)
      if (!user || !user.id) {
        throw new Error('User not found')
      } else {
        const verified = await verifyAppStorePurchaseByReceipt(transactionReceipt) as AppStorePurchase

        console.log('verified???', verified)

        // @ts-ignore
        // // const verified = verifiedByTokenPurchase as AppStorePurchase
        // verified.owner = user
        // verified.transactionReceipt = transactionReceipt
        // // verified.productId = productId
        // // verified.transactionId = verified.orderId

        // console.log('veri2', verified)

        // let purchase = await getAppStorePurchase(verified.transactionId, user.id)

        // if (purchase) {
        //   purchase = verified
        //   if (purchase.consumptionState === 1) {
        //     ctx.body = {
        //       code: 4,
        //       message: 'Purchase already completed.'
        //     }
        //     return
        //   }
        // } else {
        //   purchase = await createAppStorePurchase(verified)
        // }

        // if (purchase && purchase.status === 0) {
        //   await addYearsToUserMembershipExpiration(user.id, 1)
        //   await updateAppStorePurchase({ consumptionState: 1 }, user.id)
        //   ctx.body = {
        //     code: 0,
        //     message: 'Purchase completed successfully.'
        //   }
        // } else {
        //   ctx.body = {
        //     code: 3,
        //     message: 'Something went wrong while processing this purchase. Please email support@podverse.fm for help.'
        //   }
        // }
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const appStoreRouter = router
