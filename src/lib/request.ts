import axios from 'axios'
import { config } from '~/config'
const { userAgent } = config

export const request = async (url: string, options?: any) => {
  const headers = (options && options.headers) || {}
  const response = await axios({
    timeout: 10000,
    url,
    ...options,
    headers: {
      ...headers,
      'User-Agent': userAgent
    }
  })

  return response
}
