import axios from 'axios'
import { config } from '~/config'
import { getConnection, getRepository } from 'typeorm'
import { getAuthorityFeedUrlByPodcastIndexId, getFeedUrlByUrl } from '~/controllers/feedUrl'
import { connectToDb } from '~/lib/db'
import { parseFeedUrl } from '~/services/parser'
import { addFeedUrlsByPodcastIndexId } from '~/services/queue'
import { request } from '~/lib/request'
import { getPodcastByPodcastIndexId } from '~/controllers/podcast'
import { Podcast } from '~/entities'
const shortid = require('shortid')
const sha1 = require('crypto-js/sha1')
const encHex = require('crypto-js/enc-hex')
const csv = require('csvtojson')
const { podcastIndexConfig, userAgent } = config

const axiosRequest = async (url) => {
  const apiHeaderTime = new Date().getTime() / 1000
  const hash = sha1(config.podcastIndexConfig.authKey + config.podcastIndexConfig.secretKey + apiHeaderTime).toString(
    encHex
  )

  return axios({
    url,
    method: 'GET',
    headers: {
      'User-Agent': userAgent,
      'X-Auth-Key': podcastIndexConfig.authKey,
      'X-Auth-Date': apiHeaderTime,
      Authorization: hash
    }
  })
}

const getRecentlyUpdatedDataRecursively = async (accumulatedFeedData: any[] = [], since?: number) => {
  console.log('getRecentlyUpdatedDataRecursively')
  console.log('accumulatedFeedData.length', accumulatedFeedData.length)
  const currentTime = Math.floor(Date.now() / 1000)
  const axiosResponseData = await getRecentlyUpdatedData(since)
  const { data, itemCount, nextSince } = axiosResponseData
  console.log('itemCount', itemCount)
  console.log('since', since)
  console.log('nextSince', nextSince)
  const { feeds } = data
  console.log('feeds', feeds.length)
  accumulatedFeedData = [...accumulatedFeedData, ...feeds]
  console.log('accumulatedFeedData', accumulatedFeedData.length)
  if (itemCount >= 5000) {
    const timeRemainingSince = nextSince - currentTime
    console.log('timeRemainingSince', timeRemainingSince)
    return getRecentlyUpdatedDataRecursively(accumulatedFeedData, timeRemainingSince)
  } else {
    console.log('return final data', accumulatedFeedData.length)
    return accumulatedFeedData
  }
}

/*
  since = in seconds
*/
const getRecentlyUpdatedData = async (since?: number) => {
  let url = `${podcastIndexConfig.baseUrl}/recent/data?max=5000`

  url += `&since=${since ? since : -1800}`

  const response = await axiosRequest(url)
  return response && response.data
}

// const getRecentlyUpdatedPodcastFeeds = async () => {
//   const url = `${podcastIndexConfig.baseUrl}/recent/feeds?sort=discovery&max=1000`
//   const response = await axiosRequest(url)
//   return response && response.data
// }

type PodcastIndexDataFeed = {
  feedId: number
  feedUrl: string
}

/*
  This function determines if the feed.url returned by Podcast Index is not currently
  the authority feedUrl in our database. If it is not, then update our database to use
  the newer feed.url provided by Podcast Index.
*/
export const updateFeedUrlsIfNewAuthorityFeedUrlDetected = async (podcastIndexDataFeeds: PodcastIndexDataFeed[]) => {
  try {
    const client = await getConnection().createEntityManager()
    if (Array.isArray(podcastIndexDataFeeds)) {
      for (const podcastIndexDataFeed of podcastIndexDataFeeds) {
        try {
          if (podcastIndexDataFeed.feedId) {
            const currentFeedUrl = await getAuthorityFeedUrlByPodcastIndexId(podcastIndexDataFeed.feedId.toString())
            if (currentFeedUrl && currentFeedUrl.url !== podcastIndexDataFeed.feedUrl) {
              const podcastIndexFeed = {
                id: podcastIndexDataFeed.feedId,
                url: podcastIndexDataFeed.feedUrl
              }
              await createOrUpdatePodcastFromPodcastIndex(client, podcastIndexFeed)
            }
          }
        } catch (err) {
          console.log('updateFeedUrlsIfNewAuthorityFeedUrlDetected podcastIndexDataFeed', err)
        }
      }
    }
  } catch (err) {
    console.log('updateFeedUrlsIfNewAuthorityFeedUrlDetected err', err)
  }
}

/**
 * addRecentlyUpdatedFeedUrlsToPriorityQueue
 *
 * Request a list of all podcast feeds that have been updated
 * within the past X minutes from Podcast Index, then add
 * the feeds that have a matching podcastIndexId in our database
 * to the queue for parsing.
 */
export const addRecentlyUpdatedFeedUrlsToPriorityQueue = async (sinceTime?: number) => {
  try {
    await connectToDb()

    /* If no sinceTime provided, get all updated feeds from the past hour */
    if (!sinceTime) {
      sinceTime = Math.round(Date.now() / 1000) - 3600
    }
    const recentlyUpdatedFeeds = await getRecentlyUpdatedDataRecursively([], sinceTime)
    console.log('total recentlyUpdatedFeeds count', recentlyUpdatedFeeds.length)

    await updateFeedUrlsIfNewAuthorityFeedUrlDetected(recentlyUpdatedFeeds)

    const recentlyUpdatedPodcastIndexIds = [] as any[]
    for (const item of recentlyUpdatedFeeds) {
      const { feedId } = item
      if (feedId) {
        recentlyUpdatedPodcastIndexIds.push(feedId)
      }
    }

    const uniquePodcastIndexIds = [...new Set(recentlyUpdatedPodcastIndexIds)].slice(0, 10000)

    console.log('unique recentlyUpdatedPodcastIndexIds count', uniquePodcastIndexIds.length)

    // Send the feedUrls with matching podcastIndexIds found in our database to
    // the priority parsing queue for immediate parsing.
    if (recentlyUpdatedPodcastIndexIds.length > 0) {
      await addFeedUrlsByPodcastIndexId(uniquePodcastIndexIds)
    }
  } catch (error) {
    console.log('addRecentlyUpdatedFeedUrlsToPriorityQueue', error)
  }
}

export const getPodcastFromPodcastIndexById = async (id: string) => {
  const url = `${podcastIndexConfig.baseUrl}/podcasts/byfeedid?id=${id}`
  const response = await axiosRequest(url)
  return response && response.data
}

export const addOrUpdatePodcastFromPodcastIndex = async (client: any, id: string) => {
  const podcastIndexPodcast = await getPodcastFromPodcastIndexById(id)
  await createOrUpdatePodcastFromPodcastIndex(client, podcastIndexPodcast.feed)
  const feedUrl = await getAuthorityFeedUrlByPodcastIndexId(id)
  await parseFeedUrl(feedUrl)
}

const getNewFeeds = async () => {
  const currentTime = new Date().getTime()
  const { podcastIndexNewFeedsSinceTime } = podcastIndexConfig
  // add 5 seconds to the query to prevent podcasts falling through the cracks between requests
  const offset = 5000
  const startRangeTime = Math.floor((currentTime - (podcastIndexNewFeedsSinceTime + offset)) / 1000)

  console.log('currentTime----', currentTime)
  console.log('startRangeTime-', startRangeTime)
  const url = `${podcastIndexConfig.baseUrl}/recent/newfeeds?since=${startRangeTime}&max=1000`
  console.log('url------------', url)
  const response = await axiosRequest(url)

  return response && response.data
}

/**
 * addNewFeedsFromPodcastIndex
 *
 * Request a list of all podcast feeds that have been added
 * within the past X minutes from Podcast Index, then add
 * that feed to our database if it doesn't already exist.
 */
export const addNewFeedsFromPodcastIndex = async () => {
  await connectToDb()
  const client = await getConnection().createEntityManager()
  try {
    const response = await getNewFeeds()
    const newFeeds = response.feeds
    console.log('total newFeeds count', newFeeds.length)
    for (const item of newFeeds) {
      try {
        await createOrUpdatePodcastFromPodcastIndex(client, item)
        const feedUrl = await getFeedUrlByUrl(item.url)
        await parseFeedUrl(feedUrl)
      } catch (error) {
        console.log('addNewFeedsFromPodcastIndex item', item)
        console.log('addNewFeedsFromPodcastIndex error', error)
      }
    }
  } catch (error) {
    console.log('addNewFeedsFromPodcastIndex', error)
  }
}

/**
 * syncWithFeedUrlsCSVDump
 *
 * Basically, this function parses a CSV file of feed URLs provided by Podcast Index,
 * then adds each feed URL to our database if it doesn't already exist,
 * and retires the previous feed URLs saved in our database for that podcast if any exist.
 *
 * Longer explanation...
 * This looks for a file named podcastIndexFeedUrlsDump.csv, then iterates through
 * every podcastIndexItem in the file, then retrieves all existing feedUrls in our database
 * that have a matching podcastIndexIds.
 *
 * When no feedUrl for that podcastIndexId exists, then creates a new feedUrl
 * using the podcastIndexItem's information.
 *
 * When a feedUrl for that podcastIndexId exists, then promote the item's new url
 * to be the authority feedUrl for that podcast, and demote any other feedUrls for that podcast.
 */
export const syncWithFeedUrlsCSVDump = async (rootFilePath) => {
  await connectToDb()

  try {
    const csvFilePath = `${rootFilePath}/temp/podcastIndexFeedUrlsDump.csv`
    console.log('syncWithFeedUrlsCSVDump csvFilePath', csvFilePath)
    const client = await getConnection().createEntityManager()
    await csv()
      .fromFile(csvFilePath)
      .subscribe((json) => {
        return new Promise(async (resolve) => {
          await new Promise((r) => setTimeout(r, 25))
          try {
            await createOrUpdatePodcastFromPodcastIndex(client, json)
          } catch (error) {
            console.log('podcastIndex:syncWithFeedUrlsCSVDump subscribe error', error)
          }

          resolve()
        })
      })
  } catch (error) {
    console.log('podcastIndex:syncWithFeedUrlsCSVDump', error)
  }
}

async function createOrUpdatePodcastFromPodcastIndex(client, item) {
  console.log('-----------------------------------')
  console.log('createOrUpdatePodcastFromPodcastIndex')

  if (!item || !item.url || !item.id) {
    console.log('no item found')
  } else {
    const url = item.url
    const podcastIndexId = item.id
    const itunesId = parseInt(item.itunes_id) ? item.itunes_id : null

    console.log('feed url', url, podcastIndexId, itunesId)

    let existingPodcast = await getExistingPodcast(client, podcastIndexId)

    if (!existingPodcast) {
      console.log('podcast does not already exist')
      const isPublic = true

      await client.query(
        `
        INSERT INTO podcasts (id, "authorityId", "podcastIndexId", "isPublic")
        VALUES ($1, $2, $3, $4);
      `,
        [shortid(), itunesId, podcastIndexId, isPublic]
      )

      existingPodcast = await getExistingPodcast(client, podcastIndexId)
    } else {
      const setSQLCommand = itunesId
        ? `SET ("podcastIndexId", "authorityId") = (${podcastIndexId}, ${itunesId})`
        : `SET "podcastIndexId" = ${podcastIndexId}`
      await client.query(
        `
        UPDATE "podcasts"
        ${setSQLCommand}
        WHERE id=$1
      `,
        [existingPodcast.id]
      )
      console.log('updatedPodcast id: ', existingPodcast.id)
      console.log('updatedPodcast podcastIndexId: ', podcastIndexId)
      console.log('updatedPodcast itunesId: ', itunesId)
    }

    const existingFeedUrls = await client.query(
      `
      SELECT id, url
      FROM "feedUrls"
      WHERE "podcastId"=$1
    `,
      [existingPodcast.id]
    )

    console.log('existingFeedUrls count', existingFeedUrls.length)

    for (const existingFeedUrl of existingFeedUrls) {
      console.log('existingFeedUrl url / id', existingFeedUrl.url, existingFeedUrl.id)

      const isMatchingFeedUrl = url === existingFeedUrl.url

      await client.query(
        `
        UPDATE "feedUrls"
        SET "isAuthority"=${isMatchingFeedUrl ? 'TRUE' : 'NULL'}
        WHERE id=$1
      `,
        [existingFeedUrl.id]
      )
    }

    const updatedFeedUrlResults = await client.query(
      `
      SELECT id, url
      FROM "feedUrls"
      WHERE url=$1
    `,
      [url]
    )
    const updatedFeedUrl = updatedFeedUrlResults[0]

    if (updatedFeedUrl) {
      console.log('updatedFeedUrl already exists url / id', updatedFeedUrl.url, updatedFeedUrl.id)
    } else {
      console.log('updatedFeedUrl does not exist url / id')
      const isAuthority = true
      await client.query(
        `
        INSERT INTO "feedUrls" (id, "isAuthority", "url", "podcastId")
        VALUES ($1, $2, $3, $4);
      `,
        [shortid(), isAuthority, url, existingPodcast.id]
      )
    }
  }
  console.log('*** finished entry')
}

const getExistingPodcast = async (client, podcastIndexId) => {
  let podcasts = [] as any

  if (podcastIndexId) {
    podcasts = await client.query(
      `
      SELECT "authorityId", "podcastIndexId", id, title
      FROM podcasts
      WHERE "podcastIndexId"=$1;
    `,
      [podcastIndexId]
    )
  }

  return podcasts[0]
}

export const hideDeadPodcasts = async () => {
  console.log('hideDeadPodcasts')
  const url = 'https://public.podcastindex.org/podcastindex_dead_feeds.csv'
  const response = await request(url, {
    headers: {
      'Content-Type': 'text/csv'
    }
  })

  try {
    await csv({ noheader: true })
      .fromString(response)
      .subscribe((json) => {
        return new Promise(async (resolve) => {
          await new Promise((r) => setTimeout(r, 5))
          try {
            if (json?.field1) {
              try {
                const podcast = await getPodcastByPodcastIndexId(json.field1)
                if (podcast.isPublic) {
                  const repository = getRepository(Podcast)
                  podcast.isPublic = false
                  await new Promise((resolve) => setTimeout(resolve, 100))
                  await repository.save(podcast)
                  console.log('feed hidden successfully!', json.field1, json.field2)
                }
              } catch (error) {
                if (error.message.indexOf('not found') === -1) {
                  console.log('error hiding podcast json', json)
                  console.log('error hiding podcast json error message:', error)
                } else {
                  console.log('feed already hidden', json.field1, json.field2)
                }
              }
            }
          } catch (error) {
            console.log('podcastIndex:hideDeadPodcasts subscribe error', error)
          }

          resolve()
        })
      })
  } catch (error) {
    console.log('podcastIndex:hideDeadPodcasts', error)
  }

  console.log('hideDeadPodcasts finished')
}
