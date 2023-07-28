import * as _fetch from 'isomorphic-fetch'
import { makeThreadcap, InMemoryCache, updateThreadcap, makeRateLimitedFetcher, Protocol } from 'threadcap'
import { config } from '~/config'
const { userAgent } = config
const cache = new InMemoryCache()

const fetcherWithTimeout = async (url, opts) => {
  const abortController = new AbortController()
  setTimeout(() => {
    abortController.abort()
  }, 3000) // 3 seconds

  return await _fetch(url, {
    ...opts,
    signal: abortController.signal
  })
}

const fetcher = makeRateLimitedFetcher(fetcherWithTimeout)

let cacheTimeToLive = new Date().toISOString()
setInterval(() => {
  cacheTimeToLive = new Date().toISOString()
}, 300000) // 5 minutes

export const getThreadcap = async (url: string, protocol: Protocol, bearerToken?: string) => {
  // initialize the threadcap

  const threadcap = await makeThreadcap(url, {
    userAgent,
    cache,
    fetcher,
    protocol,
    bearerToken
  })

  // update the threadcap, process all replies
  const callbacks = {
    onEvent: (e) => {
      if (e.kind === 'node-processed' && e.part === 'comment') {
        console.log(`Processed ${e.nodeId}`)
        // threadcap is now updated with a new comment, update your UI incrementally
      }
    }
  }

  await updateThreadcap(threadcap, {
    updateTime: cacheTimeToLive,
    userAgent,
    cache,
    fetcher,
    callbacks,
    bearerToken
  })

  // final threadcap includes the comment/commenter info for the root post and all replies
  return threadcap
}
