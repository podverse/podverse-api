import createError from 'http-errors'
import { Podcast, generateShortId, getAuthorityFeedUrlByPodcastIndexId, getPodcastByPodcastIndexId } from 'podverse-orm'
import { ValueTagOriginal } from 'podverse-shared'
import { config } from '~/config'
import { parserInstance } from '~/factories/parser'
import { podcastIndexInstance } from '~/factories/podcastIndex'

const { podcastIndex } = config

// These getValueTagFor* services were intended for getting "value tag" info from Podcast Index,
// but at this point they more broadly is for retrieving the "remote item" data
// our client side apps need. The most common use case involves needing value tags
// for value time splits (VTS), but we also return additional data as the
// second item in the response data array, which gets handled as a "chapter"
// in the client side apps, to display to the listener which value time split track
// (usually a song) is playing right now.
export const getValueTagForChannelFromPodcastIndexByGuids = async (podcastGuid: string) => {
  const url = `${podcastIndex.baseUrl}/podcasts/byguid?guid=${podcastGuid}`
  let podcastValueTag: ValueTagOriginal[] | null = null

  try {
    const response = await podcastIndexInstance.podcastIndexAPIRequest(url)
    const data = response.data
    if (data?.feed?.value) {
      podcastValueTag = podcastIndexInstance.convertPIValueTagToPVValueTagArray(data.feed.value)
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
  const url = `${podcastIndex.baseUrl}/episodes/byguid?podcastguid=${podcastGuid}&guid=${episodeGuid}`
  let episodeValueTag: ValueTagOriginal[] | null = null

  try {
    const response = await podcastIndexInstance.podcastIndexAPIRequest(url)
    const data = response.data

    if (data?.episode?.value) {
      episodeValueTag = podcastIndexInstance.convertPIValueTagToPVValueTagArray(data.episode.value)
    }
  } catch (error) {
    // assume a 404
  }

  if (!episodeValueTag || episodeValueTag?.length === 0) {
    throw new createError.NotFound('Value tags not found')
  }

  return episodeValueTag
}

export const getEpisodeByGuid = async (podcastIndexId: string, episodeGuid: string) => {
  if (episodeGuid.indexOf('http') === 0) {
    episodeGuid = encodeURIComponent(episodeGuid)
  }
  const url = `${podcastIndex.baseUrl}/episodes/byguid?feedid=${podcastIndexId}&guid=${episodeGuid}`
  const response = await podcastIndexInstance.podcastIndexAPIRequest(url)
  return response && response.data
}

/*

  TODO: remove the functions below as they're duplicated in podverse-workers
*/

export const addOrUpdatePodcastFromPodcastIndex = async (client: any, podcastIndexId: string) => {
  const podcastIndexPodcast = await podcastIndexInstance.getPodcastFromPodcastIndexById(podcastIndexId)
  const allowNonPublic = true
  await createOrUpdatePodcastFromPodcastIndex(client, podcastIndexPodcast.feed)
  const feedUrl = await getAuthorityFeedUrlByPodcastIndexId(podcastIndexId, allowNonPublic)

  try {
    await parserInstance.parseFeedUrl(feedUrl, allowNonPublic)
  } catch (error) {
    console.log('addOrUpdatePodcastFromPodcastIndex error', error)
  }
}

// TODO: replace client: any with client: EntityManager
export async function createOrUpdatePodcastFromPodcastIndex(client: any, item: any) {
  console.log('-----------------------------------')
  console.log('createOrUpdatePodcastFromPodcastIndex')

  if (!item || !item.url || !item.id) {
    console.log('no item found')
  } else {
    const url = item.url
    const podcastIndexId = item.id
    const itunesId = parseInt(item.itunes_id) ? item.itunes_id : null

    console.log('feed url', url, podcastIndexId, itunesId)

    let existingPodcast: Podcast | null = null

    try {
      existingPodcast = await getPodcastByPodcastIndexId(podcastIndexId)
    } catch (error) {
      // assume not found
    }

    if (!existingPodcast) {
      console.log('podcast does not already exist')
      const isPublic = true

      await client.query(
        `
        INSERT INTO podcasts (id, "authorityId", "podcastIndexId", "isPublic")
        VALUES ($1, $2, $3, $4);
      `,
        [generateShortId(), itunesId, podcastIndexId, isPublic]
      )

      existingPodcast = await getPodcastByPodcastIndexId(podcastIndexId)
    } else {
      const setSQLCommand = itunesId
        ? `SET ("podcastIndexId", "authorityId") = (${podcastIndexId}, ${itunesId})`
        : `SET "podcastIndexId" = ${podcastIndexId}`

      await client.query(
        `
        UPDATE "podcasts"
        ${setSQLCommand}
        WHERE "podcastIndexId"=$1
      `,
        [podcastIndexId.toString()]
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

    /*
      In case the feed URL already exists in our system, but is assigned to another podcastId,
      get the feed URL for the other podcastId, so it can be assigned to the new podcastId.
    */
    const existingFeedUrlsByFeedUrl = await client.query(
      `
        SELECT id, url
        FROM "feedUrls"
        WHERE "url"=$1
      `,
      [url]
    )

    const combinedExistingFeedUrls = [...existingFeedUrls, ...existingFeedUrlsByFeedUrl]

    console.log('existingFeedUrls count', existingFeedUrls.length)

    for (const existingFeedUrl of combinedExistingFeedUrls) {
      console.log('existingFeedUrl url / id', existingFeedUrl.url, existingFeedUrl.id)

      const isMatchingFeedUrl = url === existingFeedUrl.url

      await client.query(
        `
        UPDATE "feedUrls"
        SET ("isAuthority", "podcastId") = (${isMatchingFeedUrl ? 'TRUE' : 'NULL'}, '${existingPodcast.id}')
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
        [generateShortId(), isAuthority, url, existingPodcast.id]
      )
    }
  }
  console.log('*** finished entry')
}

/*

  TODO: remove the functions above as they're duplicated in podverse-workers

*/
