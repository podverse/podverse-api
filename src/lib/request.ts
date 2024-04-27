import * as requestPromiseNative from 'request-promise-native'
import { config } from '~/config'
const { userAgent } = config
const { http, https } = require('follow-redirects')

export const request = async (url: string, options?: any) => {
  const headers = (options && options.headers) || {}
  const response = await requestPromiseNative(url, {
    timeout: 15000,
    headers: {
      ...headers,
      'User-Agent': userAgent
    },
    ...options
  })

  return response
}

export const getFinalRedirectedUrl = (url: string) => {
  console.log('getFinalRedirectedUrl', url)
  return new Promise<string>((resolve, reject) => {
    const parsedOrginalUrl = new URL(url)
    if (url.startsWith('https://')) {
      const frRequest = https
        .request(
          {
            method: 'HEAD',
            hostname: parsedOrginalUrl.hostname,
            path: parsedOrginalUrl.pathname + parsedOrginalUrl.search,
            Headers: {
              'User-Agent': userAgent
            }
          },
          (response) => {
            resolve(response.responseUrl)
          }
        )
        .on('error', (err) => {
          reject(err)
        })
      frRequest.end()
    } else {
      const frRequest = http
        .request(
          {
            method: 'HEAD',
            hostname: parsedOrginalUrl.hostname,
            path: parsedOrginalUrl.pathname + parsedOrginalUrl.search,
            Headers: {
              'User-Agent': userAgent
            }
          },
          (response) => {
            resolve(response.responseUrl)
          }
        )
        .on('error', (err) => {
          reject(err)
        })
      frRequest.end()
    }
  })
}
