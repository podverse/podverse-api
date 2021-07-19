/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import { config } from '~/config'
import { generateQueryParams } from '~/lib/utility'
const { matomoConfig, userAgent } = config
const { authToken, baseUrl, siteId } = matomoConfig

const url = `${baseUrl}`

export const queryMatomoData = async (startDate, endDate, segmentPageUrl) => {
  if (!authToken || !baseUrl || !siteId) {
    throw new Error('Matomo config variables missing.')
  }

  const batchPayload = {
    token_auth: authToken,
    module: 'API',
    method: 'Actions.getPageUrls',
    idSite: siteId,
    period: 'range',
    date: `${startDate},${endDate}`,
    format: 'json',
    filter_limit: '-1',
    flat: '1',
    segment: `pageUrl%3D@%25252F${segmentPageUrl}%25252F`
  }
  
  const urlWithParams = `${url}?${generateQueryParams(batchPayload)}`

  try {
    return axios({
     url: urlWithParams,
     method: 'GET',
     headers: {
       'User-Agent': userAgent,
     }
   })
  } catch (error) {
    console.log('queryMatomoData error:', error)
    return []
  }
}
