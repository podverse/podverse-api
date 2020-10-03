import { request } from '../lib/request'
import { config } from '~/config'
import { addFeedUrlsByAuthorityIdToPriorityQueue } from './queue'
const sha1 = require('crypto-js/sha1')
const encHex = require('crypto-js/enc-hex')
const { podcastIndexConfig, userAgent } = config

const apiHeaderTime = new Date().getTime() / 1000;
const hash = sha1(
  config.podcastIndexConfig.authKey + config.podcastIndexConfig.secretKey + apiHeaderTime
).toString(encHex);

const getRecentlyUpdatedPodcastFeeds = async () => {
  const { getRecentlyUpdatedSinceTime } = podcastIndexConfig
  const startRangeTime = Math.floor((new Date().getTime() - getRecentlyUpdatedSinceTime) / 1000)
  const url = `${podcastIndexConfig.baseUrl}/recent/feeds?since=${startRangeTime}&max=1000`

  const response = await request(url, {
    method: 'GET',
    headers: {
      'User-Agent': userAgent,
      'X-Auth-Key': podcastIndexConfig.authKey,
      'X-Auth-Date': apiHeaderTime,
      'Authorization': hash
    }
  })

  return response
}

/**
 * addRecentlyUpdatedFeedUrlsToPriorityQueue
 * 
 * Request a list of all podcast feeds that have been updated
 * within the past X minutes from Podcast Index, then add
 * the feeds that have a matching authorityId in our database
 * to the queue for parsing.
 */
export const addRecentlyUpdatedFeedUrlsToPriorityQueue = async () => {
  try {
    const response = await getRecentlyUpdatedPodcastFeeds()
    const recentlyUpdatedFeeds = response.feeds

    console.log('total recentlyUpdatedFeeds count', recentlyUpdatedFeeds.length)

    const recentlyUpdatedAuthorityIds = [] as any[]
    for (const item of recentlyUpdatedFeeds) {
      console.log('recentlyUpdatedFeed:', item)
      const { itunesId, language } = item
      if (itunesId && language) {
        recentlyUpdatedAuthorityIds.push(itunesId)
      }
    }
    
    const uniqueAuthorityIds = [...new Set(recentlyUpdatedAuthorityIds)];

    console.log('unique recentlyUpdatedAuthorityIds count', uniqueAuthorityIds.length)

    // Send the feedUrls with matching authorityIds found in our database to
    // the priority parsing queue for immediate parsing.
    if (recentlyUpdatedAuthorityIds.length > 0) {
      await addFeedUrlsByAuthorityIdToPriorityQueue(uniqueAuthorityIds)
    }
  } catch (error) {
    console.log('addRecentlyUpdatedFeedUrlsToPriorityQueue', error)
  }
}
