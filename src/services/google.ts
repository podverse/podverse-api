const { google } = require('googleapis')
import googleConfig from '~/config/google'
const path = require('path')

export const queryGoogleAnalyticsData = async queryObj => {
  const client = await google.auth.getClient({
    keyFile: path.join(__dirname, '/../config/google/jwt.keys.json'),
    scopes: ['https://www.googleapis.com/auth/analytics.readonly']
  })

  const analytics = google.analyticsreporting({
    version: 'v4',
    auth: client
  })

  const batchPayload = {
    resource: {
      reportRequests: [{
        dateRanges: [
          {
            startDate: queryObj.startDate,
            endDate: queryObj.endDate
          }
        ],
        dimensions: queryObj.dimensions,
        filtersExpression: queryObj.filtersExpression,
        metrics: queryObj.metrics,
        orderBys: queryObj.orderBys,
        pageSize: 10000,
        // pageToken: needed for pagination
        viewId: googleConfig.analytics.view_id
      }]
    }
  }

  const response = await analytics.reports.batchGet(batchPayload)
    .then(response => response)
    .catch(error => console.log(error.errors))

  return response
}

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
