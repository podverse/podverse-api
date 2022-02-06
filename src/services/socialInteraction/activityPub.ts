import * as _fetch from 'isomorphic-fetch'
import { makeThreadcap, InMemoryCache, updateThreadcap, makeRateLimitedFetcher } from 'threadcap'
import { config } from '~/config'
const { userAgent } = config
const cache = new InMemoryCache()
const fetcher = makeRateLimitedFetcher(_fetch)

export const getThreadCap = async (url: string) => {
  // initialize the threadcap
  const threadcap = await makeThreadcap(url, {
    userAgent,
    cache,
    fetcher
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
  await updateThreadcap(threadcap, { updateTime: new Date().toISOString(), userAgent, cache, fetcher, callbacks })

  // final threadcap includes the comment/commenter info for the root post and all replies
  return threadcap
}
