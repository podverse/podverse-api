const { google } = require('googleapis')
import googleConfig from '~/config/google'
const path = require('path')

export const queryGoogleAnalyticsData = async queryObj => {

  const client = await google.auth.getClient({
    keyFile: path.join(__dirname, '../config/google/jwt.keys.json'),
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
