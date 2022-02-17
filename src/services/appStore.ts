import * as request from 'request-promise-native'
import { config } from '~/config'
import { createOrUpdateAppStorePurchase } from '~/controllers/appStorePurchase'

/*
requestBody
  receipt-data: byte, base64 encoded receipt data (required)
  password: string (required for subscriptions)
  exclude-old-transactions: boolean
Docs: https://developer.apple.com/documentation/appstorereceipts/requestbody

---

responseBody
  environment: string
  is-retryable: boolean
  latest_receipt: byte
  latest_receipt_info: [responseBody.Lastest_receipt_info]
  pending_renewal_info: [responseBody.Pending_renewal_info]
  receipt: responseBody.Receipt
  status: status
Docs: https://developer.apple.com/documentation/appstorereceipts/responsebody

---

Error codes:



Docs: https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html
*/

const verifyAppStorePurchaseByReceiptRequest = (transactionReceipt: string, isProd: boolean) => {
  return request({
    method: 'POST',
    uri: `${isProd ? config.appStoreConfig.apiUrlProd : config.appStoreConfig.apiUrlSandbox}/verifyReceipt`,
    headers: { 'Content-Type': 'application/json' },
    body: {
      'receipt-data': transactionReceipt,
      password: config.appStoreConfig.sharedSecret
    },
    json: true
  })
}

/*
  From develop.apple.com docs:
  "IMPORTANT: Verify your receipt first with the production URL; proceed to verify with the sandbox URL
  if you receive a 21007 status code. Following this approach ensures that you do not have to
  switch between URLs while your application is tested, reviewed by App Review, or live in the App Store."
*/
const somethingWentWrongMessage = `Something went wrong. Please contact contact@podverse.fm for help if the problem continues.`

export const processAppStorePurchases = async (transactions: any[] = [], loggedInUserId: string) => {
  const processedTransactionIds = [] as any
  for (const transaction of transactions) {
    const appStorePurchase = await processAppStorePurchase(transaction, loggedInUserId)
    if (appStorePurchase) {
      processedTransactionIds.push(appStorePurchase.transactionId)
    }
  }
  return processedTransactionIds
}

const processAppStorePurchase = async (transaction: any, loggedInUserId: string) => {
  const newAppStorePurchase = await createOrUpdateAppStorePurchase(transaction, loggedInUserId)
  return newAppStorePurchase
}

export const verifyAppStorePurchaseByReceipt = async (transactionReceipt: string) => {
  try {
    const response = await verifyAppStorePurchaseByReceiptRequest(transactionReceipt, true)
    const { status } = response

    if (status === 0) {
      console.log('Receipt verified.')
      return response.receipt
    }

    if (status === 21007) {
      console.log(
        `This receipt is from the test environment, but it was sent to the production environment for verification. Send it to the test environment instead.`
      )
      const isProd = false
      const response = await verifyAppStorePurchaseByReceiptRequest(transactionReceipt, isProd)
      return response.receipt
    }

    if (status === 21000) {
      console.log('The App Store could not read the JSON object you provided.')
    } else if (status === 21002) {
      console.log('The data in the receipt-data property was malformed or missing.')
    } else if (status === 21003) {
      console.log('The receipt could not be authenticated.')
    } else if (status === 21004) {
      console.log('The shared secret you provided does not match the shared secret on file for your account.')
    } else if (status === 21005) {
      console.log('The receipt server is not currently available.')
    } else if (status === 21006) {
      console.log(
        `This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response.`
      )
    } else if (status === 21008) {
      console.log(
        'This receipt is from the production environment, but it was sent to the test environment for verification. Send it to the production environment instead.'
      )
    } else if (status === 21010) {
      console.log('This receipt could not be authorized. Treat this the same as if a purchase was never made.')
    } else if (status >= 21100 && status <= 21199) {
      console.log('Internal data access error.')
    }

    throw new Error(somethingWentWrongMessage)
  } catch (error) {
    console.log('verifyAppStorePurchaseByReceipt', error)
    throw error
  }
}
