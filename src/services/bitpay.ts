const fs = require('fs')
const bitpay = require('bitpay-rest')
const bitauth = require('bitauth')
import { config } from '~/config'
const { bitpayConfig } = config
const { apiKeyPath, apiKeyPassword, currency, notificationURL, price,
  redirectURL } = bitpayConfig
const uuidv4 = require('uuid/v4')

  // NOTE: necessary to decrypt your key even if you didn't enter a password
  // when you generated it. If you did specify a password, pass it as the
  // first param to bitauth.decrypt()
const encPrivkey = fs.readFileSync(apiKeyPath).toString()
const privkey = bitauth.decrypt(apiKeyPassword, encPrivkey)
const client = bitpay.createClient(privkey)

client.on('error', err => {
  console.log('bitpay client.on error')
  console.log(err)
})

// Client will take a second to automatically load your tokens,
// after which it will emit this ready event.
// You must wait for the ready event before issuing requests
// client.on('ready', () => {
//   console.log('bitpay client ready')
// })

export const createBitPayInvoiceVendor = email => {
  return new Promise((resolve, reject) => {
    const orderId = uuidv4()
    let filteredData = {
      orderId,
      price,
      currency,
      buyerEmail: email,
      notificationURL,
      redirectURL: `${redirectURL}${orderId}`
    }

    client.as('pos').post('invoices', filteredData, (err, invoice) => {
      if (err) {
        console.log(err)
        console.log('createBitPayInvoice client error')
        reject(err)
      } else {
        resolve(invoice)
      }
    })
  })
}

export const getBitPayInvoiceVendor = id => {
  return new Promise((resolve, reject) => {
    client.get(`invoices/${id}`, function (err, invoice) {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(invoice)
      }
    })
  })
}
