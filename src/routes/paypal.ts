import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { createPayPalOrder, getPayPalOrder, completePayPalOrder
  } from '~/controllers/paypalOrder'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { validatePayPalOrderCreate } from '~/middleware/queryValidation/create'
import { getPayPalCaptureInfo, getPayPalPaymentInfo } from '~/services/paypal'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/paypal` })

router.use(bodyParser())

// Get
router.get('/order/:id',
  jwtAuth,
  async ctx => {
    try {
      const paypalOrder = await getPayPalOrder(ctx.params.id, ctx.state.user.id)
      ctx.body = paypalOrder
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Create
const createOrderLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 3,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/paypal/order'
})

router.post('/order',
  validatePayPalOrderCreate,
  createOrderLimiter,
  jwtAuth,
  async ctx => {
    try {
      const body: any = ctx.request.body
      body.owner = ctx.state.user.id

      const paypalOrder = await createPayPalOrder(body)
      ctx.body = paypalOrder
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// PayPal Webhook: update order status after payment completed
router.post('/webhooks/payment-completed',
  async ctx => {
    try {
      const body = ctx.request.body as any
      console.log('/webhooks/payment-completed body', body)

      if (body.resource_version === '2.0') {
        const paymentID = body.resource.id
        const capture = await getPayPalCaptureInfo(paymentID)
        console.log('paypal capture', capture)
        // complete pay pal order
      } else if (body.event_version === '1.0') {
        const paymentID = body.resource.parent_payment
        const order = await getPayPalPaymentInfo(paymentID)
        console.log('paypal order', order)
        const { state } = order
        await completePayPalOrder(paymentID, state)
      }
      
      ctx.status = 200
    } catch (error) {
      console.log(error)
      ctx.status = 200
    }
  }
)

export const paypalRouter = router
