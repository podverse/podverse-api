import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { completePayPalOrder, createPayPalOrder, getPayPalOrder, updatePayPalOrder
  } from 'controllers/paypalOrder'
import { jwtAuth } from 'middleware/auth/jwtAuth'
import { validatePayPalOrderCreate } from 'middleware/queryValidation/create'
import { validatePayPalOrderUpdate } from 'middleware/queryValidation/update'
import { verifyWebhookSignature, getPayPalResponseHeaders } from 'services/paypal'

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
router.post('/order',
  validatePayPalOrderCreate,
  jwtAuth,
  async ctx => {
    try {
      let body: any = ctx.request.body
      body.owner = ctx.state.user.id

      const paypalOrder = await createPayPalOrder(body)
      ctx.body = paypalOrder
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update
router.patch('/order',
  validatePayPalOrderUpdate,
  jwtAuth,
  async ctx => {
    try {
      const body = ctx.request.body
      const paypalOrder = await updatePayPalOrder(body, ctx.state.user.id)
      ctx.body = paypalOrder
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// PayPal Webhook: update order status after payment completed
router.post('/webhooks/payment-completed',
  async ctx => {
    try {
      const body = ctx.request.body

      const headers = getPayPalResponseHeaders(ctx)

      let isVerified = false

      if (process.env.NODE_ENV === 'production') {
        isVerified = await verifyWebhookSignature(headers, body)
      } else {
        isVerified = true
      }

      if (isVerified) {
        await completePayPalOrder(body)
      }

      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

export default router
