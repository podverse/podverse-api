const fs = require('fs')
const bitpay = require('bitpay-rest')
const bitauth = require('bitauth')
import { config } from '~/config'
const { bitpayConfig } = config
const { apiKeyPassword, apiKeyPath, currency, notificationURL, price, redirectURL } = bitpayConfig
const uuidv4 = require('uuid/v4')

// NOTE: It's necessary to decrypt your key even if you didn't enter a password
// when you generated it. If you did specify a password, pass it as the
// first param to bitauth.decrypt()
let encPrivKey
let privkey
let client
try {
  encPrivKey = fs.readFileSync(apiKeyPath).toString()
  privkey = bitauth.decrypt(apiKeyPassword, encPrivKey)
  client = bitpay.createClient(privkey)
  console.log('bitpay key found')
  console.log('encPrivKey', encPrivKey)
  console.log('privkey', privkey)
  console.log('client', client)
} catch (error) {
  console.log('bitpay api.key not found. You\'ll need to setup and pair a BitPay API token within this container.')
}

if (client) {
  client.on('error', err => {
    console.log('bitpay client.on error')
    console.log(err)
  })
}

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

    if (client) {
      client.as('pos').post('invoices', filteredData, (err, invoice) => {
        if (err) {
          console.log(err)
          console.log('createBitPayInvoice client error')
          reject(err)
        } else {
          resolve(invoice)
        }
      })
    }
  })
}

export const getBitPayInvoiceVendor = id => {
  return new Promise((resolve, reject) => {
    if (client) {
      client.get(`invoices/${id}`, function (err, invoice) {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(invoice)
        }
      })
    }
  })
}
