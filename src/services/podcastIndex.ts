import axios from 'axios'
import { config } from '~/config'
import { getConnection } from "typeorm"
import { connectToDb } from '~/lib/db'
import { removeProtocol } from '~/lib/utility'
import { addFeedUrlsByPodcastIndexIdToPriorityQueue } from './queue'
const shortid = require('shortid')
const sha1 = require('crypto-js/sha1')
const encHex = require('crypto-js/enc-hex')
const csv = require('csvtojson')
const { podcastIndexConfig, userAgent } = config

const apiHeaderTime = new Date().getTime() / 1000;
const hash = sha1(
  config.podcastIndexConfig.authKey + config.podcastIndexConfig.secretKey + apiHeaderTime
).toString(encHex);

const axiosRequest = async (url) => {
  return axios({
    url,
    method: 'GET',
    headers: {
      'User-Agent': userAgent,
      'X-Auth-Key': podcastIndexConfig.authKey,
      'X-Auth-Date': apiHeaderTime,
      'Authorization': hash
    }
  })
}

const getRecentlyUpdatedPodcastFeeds = async () => {
  const { getRecentlyUpdatedSinceTime } = podcastIndexConfig
  const currentTime = new Date().getTime()
  // add 30 seconds to the query to prevent podcasts falling through the cracks between requests
  const offset = 30000
  const startRangeTime = Math.floor((currentTime - (getRecentlyUpdatedSinceTime + offset)) / 1000)

  console.log('currentTime----', currentTime)
  console.log('startRangeTime-', startRangeTime)
  const url = `${podcastIndexConfig.baseUrl}/podcasts/updated?since=${startRangeTime}&max=1000`
  console.log('url------------', url)
  const response = await axiosRequest(url)

  return response && response.data
}

/**
 * addRecentlyUpdatedFeedUrlsToPriorityQueue
 * 
 * Request a list of all podcast feeds that have been updated
 * within the past X minutes from Podcast Index, then add
 * the feeds that have a matching podcastIndexId in our database
 * to the queue for parsing.
 */
export const addRecentlyUpdatedFeedUrlsToPriorityQueue = async () => {
  try {
    const response = await getRecentlyUpdatedPodcastFeeds()
    const recentlyUpdatedFeeds = response.feeds

    console.log('total recentlyUpdatedFeeds count', recentlyUpdatedFeeds.length)

    const recentlyUpdatedPodcastIndexIds = [] as any[]
    for (const item of recentlyUpdatedFeeds) {
      const { itunesId } = item
      if (itunesId) {
        recentlyUpdatedPodcastIndexIds.push(itunesId)
      }
    }
    
    const uniquePodcastIndexIds = [...new Set(recentlyUpdatedPodcastIndexIds)].slice(0, 1000);

    console.log('unique recentlyUpdatedPodcastIndexIds count', uniquePodcastIndexIds.length)

    // Send the feedUrls with matching podcastIndexIds found in our database to
    // the priority parsing queue for immediate parsing.
    if (recentlyUpdatedPodcastIndexIds.length > 0) {
      await addFeedUrlsByPodcastIndexIdToPriorityQueue(uniquePodcastIndexIds)
    }
  } catch (error) {
    console.log('addRecentlyUpdatedFeedUrlsToPriorityQueue', error)
  }
}

const getNewFeeds = async () => {
  const currentTime = new Date().getTime()
  const { podcastIndexNewFeedsSinceTime } = podcastIndexConfig
  // add 30 seconds to the query to prevent podcasts falling through the cracks between requests
  const offset = 30000
  const startRangeTime = Math.floor((currentTime - (podcastIndexNewFeedsSinceTime + offset)) / 1000)

  console.log('currentTime----', currentTime)
  console.log('startRangeTime-', startRangeTime)
  const url = `${podcastIndexConfig.baseUrl}/recent/newfeeds?since=${startRangeTime}&max=1000`
  console.log('url------------', url)
  const response = await axiosRequest(url)

  return response && response.data
}

/**
 * addNewFeedsToPriorityQueue
 * 
 * Request a list of all podcast feeds that have been added
 * within the past X minutes from Podcast Index, then add
 * that feed to our database if it doesn't already exist.
 */
export const addNewFeedsToPriorityQueue = async () => {
  try {
    const response = await getNewFeeds()
    const newFeeds = response.feeds

    console.log('total newFeeds count', newFeeds.length)

    const newPodcastIndexIds = [] as any[]
    for (const item of newFeeds) {
      const { itunesId } = item
      if (itunesId) {
        newPodcastIndexIds.push(itunesId)
      }
    }

    const uniquePodcastIndexIds = [...new Set(newPodcastIndexIds)].slice(0, 1000);

    console.log('unique newPodcastIndexIds count', uniquePodcastIndexIds.length)

    // Send the feedUrls with matching podcastIndexIds found in our database to
    // the priority parsing queue for immediate parsing.
    if (newPodcastIndexIds.length > 0) {
      await addFeedUrlsByPodcastIndexIdToPriorityQueue(uniquePodcastIndexIds)
    }
  } catch (error) {
    console.log('addNewFeedUrlsToPriorityQueue', error)
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
 * When a feedUrl for that podcastIndexId exists, then promote the item's url
 * to be the authority feedUrl for that podcast, and demote any other feedUrls for that podcast.
 */
export const syncWithFeedUrlsCSVDump = async (rootFilePath) => {
  await connectToDb()

  try {
    const csvFilePath = `${rootFilePath}/temp/podcastIndexFeedUrlsDump.csv`;
    const client = await getConnection().createEntityManager()
    await csv()
      .fromFile(csvFilePath)
      .subscribe((json) => {
        return new Promise(async (resolve) => {
          await new Promise(r => setTimeout(r, 200));
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

  if (!item) {
    console.log('no item found')
  } else {
    const url = item.url
    const podcastIndexId = item.id
    const itunesId = item.itunes_id ? item.itunes_id : null

    console.log('feed url', url, podcastIndexId, itunesId)
    
    let existingPodcast = await getExistingPodcast(client, podcastIndexId, itunesId)

    if (!existingPodcast) {
      console.log('podcast does not already exist')
      const isPublic = true

      await client.query(`
        INSERT INTO podcasts (id, "authorityId", "podcastIndexId", "isPublic")
        VALUES ($1, $2, $3, $4);
      `, [shortid(), itunesId, podcastIndexId, isPublic])

      existingPodcast = await getExistingPodcast(client, podcastIndexId, itunesId)
    } else {
      const setSQLCommand = itunesId
        ? `SET ("podcastIndexId", "authorityId") = (${podcastIndexId}, ${itunesId})`
        : `SET "podcastIndexId" = ${podcastIndexId}`
      await client.query(`
        UPDATE "podcasts"
        ${setSQLCommand}
        WHERE id=$1
      `, [existingPodcast.id])
      console.log('updatedPodcast id: ', existingPodcast.id)
      console.log('updatedPodcast podcastIndexId: ', podcastIndexId)
      console.log('updatedPodcast itunesId: ', itunesId)
    }

    const existingFeedUrls = await client.query(`
      SELECT id, url
      FROM "feedUrls"
      WHERE "podcastId"=$1
    `, [existingPodcast.id])
    
    console.log('existingFeedUrls count', existingFeedUrls.length)

    for (const existingFeedUrl of existingFeedUrls) {
      console.log('existingFeedUrl url / id', existingFeedUrl.url, existingFeedUrl.id)

      const isMatchingFeedUrl = removeProtocol(url) === removeProtocol(existingFeedUrl.url)

      await client.query(`
        UPDATE "feedUrls"
        SET "isAuthority"=${isMatchingFeedUrl ? 'TRUE' : 'FALSE'}
        WHERE id=$1
      `, [existingFeedUrl.id])
    }

    const updatedFeedUrlResults = await client.query(`
      SELECT id, url
      FROM "feedUrls"
      WHERE url=$1
    `, [url])
    const updatedFeedUrl = updatedFeedUrlResults[0]
    console.log('updatedFeedUrl', updatedFeedUrl)

    if (updatedFeedUrl) {
      console.log('updatedFeedUrl already exists url / id', updatedFeedUrl.url, updatedFeedUrl.id)
    } else {
      console.log('updatedFeedUrl does not exist url / id')
      const isAuthority = true
      await client.query(`
        INSERT INTO "feedUrls" (id, "isAuthority", "url", "podcastId")
        VALUES ($1, $2, $3, $4);
      `, [shortid(), isAuthority, url, existingPodcast.id])
    }
  }
  console.log('*** finished entry')
}

const getExistingPodcast = async (client, podcastIndexId, authorityId) => {
  let podcasts = [] as any

  if (podcastIndexId) {
    podcasts = await client.query(`
      SELECT "authorityId", "podcastIndexId", id, title
      FROM podcasts
      WHERE "podcastIndexId"=$1;
    `, [podcastIndexId])
  }

  if ((!podcasts || podcasts.length === 0) && authorityId) {
    podcasts = await client.query(`
      SELECT "authorityId", "podcastIndexId", id, title
      FROM podcasts
      WHERE "authorityId"=$1;
    `, [authorityId])
  }

  return podcasts[0]
}
