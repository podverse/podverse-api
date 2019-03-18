import { config } from '~/config'
const { paypalConfig } = config
const { clientId, clientSecret } = paypalConfig
const paypal = require('paypal-rest-sdk')
const payments = paypal.v1.payments

let env
if (process.env.NODE_ENV === 'production') {
  env = new paypal.core.LiveEnvironment(clientId, clientSecret)
} else {
  env = new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

let client = new paypal.core.PayPalHttpClient(env)

export const getPayPalPaymentInfo = paymentId => {
  let request = new payments.PaymentGetRequest(paymentId)

  return client.execute(request).then((response) => {
    return response.result
  })
}
