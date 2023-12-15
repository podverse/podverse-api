import createError from 'http-errors'
import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { accountClaimErrorMessages, getAccountClaimToken, redeemAccountClaimToken } from 'podverse-orm'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/claim-account` })

router.use(bodyParser())

// Get
router.get('/:id', async (ctx) => {
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

router.post('/', redeemAccountClaimTokenLimiter, async (ctx) => {
  try {
    const body: any = ctx.request.body

    if (body && body.id && body.email) {
      await redeemAccountClaimToken(body.id, body.email)
    } else if (body && body.id && !body.email) {
      throw new createError.BadRequest('Please provide a valid email.')
    } else {
      throw new createError.NotFound('AccountClaimToken id not found. Please provide a valid claim token.')
    }

    ctx.status = 200
  } catch (error) {
    if (error.message === accountClaimErrorMessages.accountClaimToken.redeem.accountClaimTokenNotFound) {
      ctx.status = 404
      ctx.body = { message: accountClaimErrorMessages.accountClaimToken.redeem.accountClaimTokenNotFound }
    } else if (error.message === accountClaimErrorMessages.accountClaimToken.redeem.alreadyClaimed) {
      ctx.status = 405
      ctx.body = { message: accountClaimErrorMessages.accountClaimToken.redeem.alreadyClaimed }
    } else if (error.message === 'User not found.') {
      ctx.status = 404
      ctx.body = { message: accountClaimErrorMessages.accountClaimToken.redeem.emailNotFound }
    }

    emitRouterError(error, ctx)
  }
})

export const accountClaimTokenRouter = router
