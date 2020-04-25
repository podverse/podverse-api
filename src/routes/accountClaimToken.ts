import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getAccountClaimToken, redeemAccountClaimToken } from '~/controllers/accountClaimToken'
const createError = require('http-errors')
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/claim-account` })

router.use(bodyParser())

// Get
router.get('/:id',
  async ctx => {
    try {
      const accountClaimToken = await getAccountClaimToken(ctx.params.id)
      ctx.body = accountClaimToken
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Redeem
const redeemAccountClaimTokenLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 5,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/claim-account'
})

router.post('/',
  redeemAccountClaimTokenLimiter,
  async ctx => {
    try {
      const body: any = ctx.request.body

      if (body && body.id) {
        await redeemAccountClaimToken(body.id)
      } else {
        throw new createError.NotFound('AccountClaimToken id not found. Please provide a valid claim token.')
      }

      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const accountClaimTokenRouter = router
