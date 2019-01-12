import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { createCoingateOrder as createCoingateOrderLocal, getCoingateOrder as
  getCoingateOrderLocal, updateCoingateOrder as updateCoingateOrderLocal }
  from 'controllers/coingate'
import { jwtAuth } from 'middleware/auth/jwtAuth'
import { createCoingateOrder as createCoingateOrderVendor } from 'services/coingate'
import { validateCoingateOrderCreate } from 'middleware/queryValidation/create'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/coingate` })

router.use(bodyParser())

// Get
router.get('/order/:id',
  jwtAuth,
  async ctx => {
    try {
      const coingateOrder = await getCoingateOrderLocal(ctx.params.id, ctx.state.user.id)
      ctx.body = coingateOrder
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Create
router.post('/order',
  validateCoingateOrderCreate,
  jwtAuth,
  async ctx => {
    try {
      const localCoingateOrder = await createCoingateOrderLocal()
      console.log(1, localCoingateOrder)
      if (localCoingateOrder) {
        const obj = {
          order_id: localCoingateOrder.id,
          token: localCoingateOrder.token
        }

        const response = await createCoingateOrderVendor(obj)
        const vendorCoingateOrder = response.data

        console.log(2, vendorCoingateOrder)

        if (vendorCoingateOrder) {
          const updatedCoingateOrder = {
            id: localCoingateOrder.id,
            orderCreatedAt: vendorCoingateOrder.created_at,
            paymentUrl: vendorCoingateOrder.payment_url,
            priceAmount: vendorCoingateOrder.price_amount,
            priceCurrency: vendorCoingateOrder.price_currency,
            receiveAmount: vendorCoingateOrder.receive_amount,
            receiveCurrency: vendorCoingateOrder.receive_currency,
            status: vendorCoingateOrder.status,
            token: vendorCoingateOrder.token
          }

          const order = await updateCoingateOrderLocal(updatedCoingateOrder)
          ctx.body = order
        }
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Coingate Webhook: update order status after any status change
router.post('/webhooks/payment-status-updated',
  async ctx => {
    // try {
    //   const body = ctx.request.body

    //   const headers = getPayPalResponseHeaders(ctx)

    //   let isVerified = false

    //   if (process.env.NODE_ENV === 'production') {
    //     isVerified = await verifyWebhookSignature(headers, body)
    //   } else {
    //     isVerified = true
    //   }

    //   if (isVerified) {
    //     await completePayPalOrder(body)
    //   }

    //   ctx.status = 200
    // } catch (error) {
    //   emitRouterError(error, ctx)
    // }
  }
)

export default router
