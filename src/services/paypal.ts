import { config } from '~/config'
const { paypalConfig } = config
const { clientId, clientSecret } = paypalConfig
// TODO: move paypal-rest-sdk to external-services
const paypal = require('paypal-rest-sdk')
const payments = paypal.v1.payments

let env
if (process.env.NODE_ENV === 'production') {
  env = new paypal.core.LiveEnvironment(clientId, clientSecret)
} else {
  env = new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

const client = new paypal.core.PayPalHttpClient(env)

export const getPayPalPaymentInfo = (paymentId) => {
  console.log('getPayPalPaymentInfo', paymentId)
  const request = new payments.PaymentGetRequest(paymentId)

  return client.execute(request).then((response) => {
    return response.result
  })
}

export const getPayPalCaptureInfo = (paymentId) => {
  console.log('getPayPalCaptureInfo', paymentId)
  const request = new payments.CaptureGetRequest(paymentId)
  return client.execute(request).then((response) => {
    return response.result
  })
}
