import createError from 'http-errors'
import { convertPIValueTagToPVValueTagArray, PodcastIndexAPIService } from 'podverse-external-services'
import { ValueTagOriginal } from 'podverse-shared'
import { getConnection, getRepository } from 'typeorm'
import { config } from '~/config'
import { getAuthorityFeedUrlByPodcastIndexId, getFeedUrlByUrl, getPodcastByPodcastIndexId, Podcast } from 'podverse-orm'
import { connectToDb } from '~/lib/db'
import { parseFeedUrl } from '~/services/parser'
import { request } from '~/lib/request'
const shortid = require('shortid')
const csv = require('csvtojson')
const { podcastIndexConfig, userAgent } = config

const instance = new PodcastIndexAPIService({
  authKey: podcastIndexConfig.authKey,
  baseUrl: podcastIndexConfig.baseUrl,
  secretKey: podcastIndexConfig.secretKey,
  userAgent
})

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

/* since = in seconds */
const getRecentlyUpdatedData = async (since?: number) => {
  let url = `${podcastIndexConfig.baseUrl}/recent/data?max=5000`
  url += `&since=${since ? since : -1800}`
  const response = await instance.podcastIndexAPIRequest(url)
  return response && response.data
}

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
    console.log('updateFeedUrlsIfNewAuthorityFeedUrlDetected', podcastIndexDataFeeds?.length)
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
 * within the past X time from Podcast Index, then add
 * the feeds that have a matching podcastIndexId in our database
 * to the queue for parsing.
 * sinceTime = epoch time to start from in seconds
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

    // TODO: THIS TAKES A VERY LONG TIME TO COMPLETE,
    // AND IS ARBITRARILY LIMITED TO 10000...
    // const uniquePodcastIndexIds = [...new Set(recentlyUpdatedPodcastIndexIds)].slice(0, 10000)

    // console.log('unique recentlyUpdatedPodcastIndexIds count', uniquePodcastIndexIds.length)

    // Send the feedUrls with matching podcastIndexIds found in our database to
    // the priority parsing queue for immediate parsing.
    if (recentlyUpdatedPodcastIndexIds.length > 0) {
      await addFeedsToQueueForParsingByPodcastIndexId(recentlyUpdatedPodcastIndexIds)
    }
  } catch (error) {
    console.log('addRecentlyUpdatedFeedUrlsToPriorityQueue', error)
  }
}

export const getPodcastFromPodcastIndexByGuid = async (podcastGuid: string) => {
  const url = `${podcastIndexConfig.baseUrl}/podcasts/byguid?guid=${podcastGuid}`
  let podcastIndexPodcast: any = null
  try {
    const response = await instance.podcastIndexAPIRequest(url)
    podcastIndexPodcast = response.data
  } catch (error) {
    // assume a 404
  }

  if (!podcastIndexPodcast) {
    throw new createError.NotFound('Podcast not found in Podcast Index')
  }

  return podcastIndexPodcast
}

// These getValueTagFor* services were intended for getting "value tag" info from Podcast Index,
// but at this point they more broadly is for retrieving the "remote item" data
// our client side apps need. The most common use case involves needing value tags
// for value time splits (VTS), but we also return additional data as the
// second item in the response data array, which gets handled as a "chapter"
// in the client side apps, to display to the listener which value time split track
// (usually a song) is playing right now.
export const getValueTagForChannelFromPodcastIndexByGuids = async (podcastGuid: string) => {
  const url = `${podcastIndexConfig.baseUrl}/podcasts/byguid?guid=${podcastGuid}`
  let podcastValueTag: ValueTagOriginal[] | null = null

  try {
    const response = await instance.podcastIndexAPIRequest(url)
    const data = response.data
    if (data?.feed?.value) {
      podcastValueTag = convertPIValueTagToPVValueTagArray(data.feed.value)
    }
  } catch (error) {
    // assume a 404
  }

  if (!podcastValueTag || podcastValueTag?.length === 0) {
    throw new createError.NotFound('Value tags not found')
  }

  return podcastValueTag
}

// see note above
export const getValueTagForItemFromPodcastIndexByGuids = async (podcastGuid: string, episodeGuid: string) => {
  if (episodeGuid.indexOf('http') === 0) {
    episodeGuid = encodeURIComponent(episodeGuid)
  }
  const url = `${podcastIndexConfig.baseUrl}/episodes/byguid?podcastguid=${podcastGuid}&guid=${episodeGuid}`
  let episodeValueTag: ValueTagOriginal[] | null = null

  try {
    const response = await instance.podcastIndexAPIRequest(url)
    const data = response.data

    if (data?.episode?.value) {
      episodeValueTag = convertPIValueTagToPVValueTagArray(data.episode.value)
    }
  } catch (error) {
    // assume a 404
  }

  if (!episodeValueTag || episodeValueTag?.length === 0) {
    throw new createError.NotFound('Value tags not found')
  }

  return episodeValueTag
}

export const addOrUpdatePodcastFromPodcastIndex = async (client: any, podcastIndexId: string) => {
  const podcastIndexPodcast = await instance.getPodcastFromPodcastIndexById(podcastIndexId)
  const allowNonPublic = true
  await createOrUpdatePodcastFromPodcastIndex(client, podcastIndexPodcast.feed)
  const feedUrl = await getAuthorityFeedUrlByPodcastIndexId(podcastIndexId, allowNonPublic)

  try {
    const forceReparsing = true
    const cacheBust = true
    await parseFeedUrl(feedUrl, forceReparsing, cacheBust, allowNonPublic)
  } catch (error) {
    console.log('addOrUpdatePodcastFromPodcastIndex error', error)
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
        return new Promise<void>(async (resolve) => {
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

export const hideDeadPodcasts = async (fileUrl?: string) => {
  console.log('hideDeadPodcasts')
  const url = fileUrl ? fileUrl : 'https://public.podcastindex.org/podcastindex_dead_feeds.csv'
  console.log('url', url)

  const response = await request(url, {
    headers: {
      'Content-Type': 'text/csv'
    }
  })

  try {
    await csv({ noheader: true })
      .fromString(response)
      .subscribe((json) => {
        return new Promise<void>(async (resolve) => {
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
                  // console.log('feed already hidden', json.field1, json.field2)
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

export const getEpisodeByGuid = async (podcastIndexId: string, episodeGuid: string) => {
  if (episodeGuid.indexOf('http') === 0) {
    episodeGuid = encodeURIComponent(episodeGuid)
  }
  const url = `${podcastIndexConfig.baseUrl}/episodes/byguid?feedid=${podcastIndexId}&guid=${episodeGuid}`
  const response = await instance.podcastIndexAPIRequest(url)
  return response && response.data
}
