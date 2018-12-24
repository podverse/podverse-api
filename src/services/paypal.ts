import { config } from 'config'
const { paypalConfig } = config
const { clientId, clientSecret, mode, webhookIdPaymentSaleCompleted } = paypalConfig
const paypal = require('paypal-rest-sdk')

paypal.configure({
  mode,
  'client_id': clientId,
  'client_secret': clientSecret
})

export const getPayPalResponseHeaders = (ctx) => ({
  authAlgo: ctx.headers['paypal-auth-algo'],
  certURL: ctx.headers['paypal-cert-url'],
  transmissionId: ctx.headers['paypal-transmission-id'],
  transmissionSig: ctx.headers['paypal-transmission-sig'],
  transmissionTime: ctx.headers['paypal-transmission-time']
})

export const verifyWebhookSignature = (headers, webhookEvent) => {

  const requestHeaders = {
    'paypal-auth-algo': headers.authAlgo,
    'paypal-cert-url': headers.certURL,
    'paypal-transmission-id': headers.transmissionId,
    'paypal-transmission-sig': headers.transmissionSignature,
    'paypal-transmission-time': headers.transmissionTimestamp
  }

  return paypal.notification.webhookEvent.verify(
    requestHeaders,
    webhookEvent,
    webhookIdPaymentSaleCompleted,
    (error, response) => {
      if (error) {
        console.log('PayPal: invalid webhook signature')
        console.log(error)
      } else {
        if (response.verification_status === 'SUCCESS') {
          return true
        }
      }

      return false
    })
}
