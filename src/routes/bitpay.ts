import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { createBitPayInvoice as createBitPayInvoiceLocal, getBitPayInvoiceStatus as
  getBitPayInvoiceStatusLocal, updateBitPayInvoice as updateBitPayInvoiceLocal
  } from 'controllers/bitpayInvoice'
import { getLoggedInUser } from 'controllers/user'
import { jwtAuth } from 'middleware/auth/jwtAuth'
import { validateBitPayInvoiceCreate } from 'middleware/queryValidation/create'
import { createBitPayInvoice as createBitPayInvoiceVendor, getBitPayInvoice
  as getBitPayInvoiceVendor } from 'services/bitpay'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/bitpay` })

router.use(bodyParser())

// Get
router.get('/invoice/:id',
  jwtAuth,
  async ctx => {
    try {
      const bitpayInvoice = await getBitPayInvoiceStatusLocal(ctx.params.id, ctx.state.user.id)
      ctx.body = bitpayInvoice
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Create
router.post('/invoice',
  validateBitPayInvoiceCreate,
  jwtAuth,
  async ctx => {
    try {
      const user = await getLoggedInUser(ctx.state.user.id)

      if (user) {
        const response: any = await createBitPayInvoiceVendor(user.email)

        const bitpayInvoice = await createBitPayInvoiceLocal(response, ctx.state.user.id)

        ctx.body = {
          url: bitpayInvoice.url
        }
      } else {
        throw new Error('User not found')
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Handle notification
router.post('/notification',
  async ctx => {
    try {
      // @ts-ignore
      const invoiceId = ctx.request.body && ctx.request.body.id

      if (invoiceId) {
        const response: any = await getBitPayInvoiceVendor(invoiceId)

        if (response) {
          try {
            await updateBitPayInvoiceLocal(response)
            ctx.status = 200
          } catch (error) {
            console.log(error)
            ctx.status = 200 // Tell BitPay to stop sending the notification with 200
            ctx.body = 'Could not update this invoice'
          }
        } else {
          ctx.status = 200 // Tell BitPay to stop sending the notification with 200
          ctx.body = 'No invoice matching that id found'
        }
      } else {
        ctx.status = 200 // Tell BitPay to stop sending the notification with 200
        ctx.body = 'No invoice id provided'
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

export default router
