import axios from 'axios'
import { config } from '~/config'
const { CancelToken } = axios
const { userAgent } = config

export const request = async (url: string, options?: any) => {
  const headers = (options && options.headers) || {}
  const source = CancelToken.source();
  const defaultTimeout = 10000;

  /*
    This extra timeout handling is for cancelling the request if it takes too long.
    Sometimes a valid RSS feed response is received from a server, but the contents
    take forever to load, and the axios timeout apparently is not called because
    the connection is still ongoing.
  */
  const extraTimeout = setTimeout(() => {
    source.cancel('Operation canceled by due to timeout / response taking too long.')
  }, defaultTimeout + 2000)

  const response = await axios({
    cancelToken: source.token,
    timeout: defaultTimeout,
    url,
    ...options,
    headers: {
      ...headers,
      'User-Agent': userAgent
    }
  })

  clearTimeout(extraTimeout)

  return response.data
}
