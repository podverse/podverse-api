const { google } = require('googleapis')
const path = require('path')

const packageName = 'com.podverse'

export const getGoogleApiPurchaseByToken = async (productId: string, token: string) => {
  const client = await google.auth.getClient({
    keyFile: path.join(__dirname, '/../config/google/jwt.keys.json'),
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
  })

  const androidpublisher = google.androidpublisher({
    version: 'v3',
    auth: client
  })

  // https://developers.google.com/android-publisher/api-ref/purchases/products/get
  const result = await androidpublisher.purchases.products.get({ packageName, productId, token })

  return result.data
}
