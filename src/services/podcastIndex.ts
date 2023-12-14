import createError from 'http-errors'
import { ValueTagOriginal } from 'podverse-shared'
import { config } from '~/config'
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
