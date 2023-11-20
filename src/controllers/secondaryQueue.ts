import { LessThan, MoreThan, getRepository } from 'typeorm'
import { Episode, Podcast } from '~/entities'
import { getPlaylist } from './playlist'
import { combineAndSortPlaylistItems } from 'podverse-shared'
const createError = require('http-errors')

const relations = ['liveItem', 'podcast']

type SecondaryQueueEpisodesForPodcastIdResponseData = {
  previousEpisodes: Episode[]
  nextEpisodes: Episode[]
  inheritedPodcast: Podcast
}

export const getSecondaryQueueEpisodesForPodcastId = async (
  episodeId: string,
  podcastId: string
): Promise<SecondaryQueueEpisodesForPodcastIdResponseData> => {
  const repository = getRepository(Episode)
  const currentEpisode = await repository.findOne(
    {
      isPublic: true,
      id: episodeId
    },
    { relations }
  )

  if (!currentEpisode || currentEpisode.liveItem) {
    throw new createError.NotFound('Episode not found')
  }

  const inheritedPodcast = currentEpisode.podcast
  if (!inheritedPodcast) {
    throw new createError.NotFound('Podcast not found')
  }

  const { itunesEpisode, pubDate } = currentEpisode
  const take = currentEpisode.podcast.medium === 'music' ? 50 : 10

  const previousEpisodesAndWhere =
    currentEpisode.podcast.medium === 'music'
      ? { itunesEpisode: LessThan(itunesEpisode) }
      : { pubDate: MoreThan(pubDate) }
  const previousEpisodesOrder =
    currentEpisode.podcast.medium === 'music' ? ['itunesEpisode', 'ASC'] : ['pubDate', 'DESC']
  const previousEpisodes = await repository.find({
    where: {
      isPublic: true,
      podcastId,
      ...previousEpisodesAndWhere
    },
    order: {
      [previousEpisodesOrder[0]]: previousEpisodesOrder[1]
    },
    take,
    relations: ['authors', 'podcast', 'podcast.authors']
  })

  const nextEpisodesAndWhere =
    currentEpisode.podcast.medium === 'music'
      ? { itunesEpisode: MoreThan(itunesEpisode) }
      : { pubDate: LessThan(pubDate) }
  const nextEpisodesOrder = currentEpisode.podcast.medium === 'music' ? ['itunesEpisode', 'ASC'] : ['pubDate', 'DESC']
  const nextEpisodes = await repository.find({
    where: {
      isPublic: true,
      podcastId,
      ...nextEpisodesAndWhere
    },
    order: {
      [nextEpisodesOrder[0]]: nextEpisodesOrder[1]
    },
    take,
    relations: ['authors', 'podcast', 'podcast.authors']
  })

  return { previousEpisodes, nextEpisodes, inheritedPodcast }
}

type SecondaryQueueEpisodesForPlaylistIdResponseData = {
  previousEpisodesAndMediaRefs: Episode[]
  nextEpisodesAndMediaRefs: Episode[]
}

export const getSecondaryQueueEpisodesForPlaylist = async (
  playlistId: string,
  episodeOrMediaRefId: string,
  audioOnly: boolean
): Promise<SecondaryQueueEpisodesForPlaylistIdResponseData> => {
  const currentPlaylist = await getPlaylist(playlistId)

  if (!currentPlaylist) {
    throw new createError.NotFound('Playlist not found')
  }

  const { episodes, itemsOrder, mediaRefs } = currentPlaylist

  const combinedPlaylistItems = combineAndSortPlaylistItems(episodes as any, mediaRefs as any, itemsOrder as any)
  let filteredPlaylistItems = combinedPlaylistItems
  if (audioOnly) {
    filteredPlaylistItems = filteredPlaylistItems.filter((item: any) => {
      if (item?.startTime) {
        const mediaRef = item
        return !mediaRef?.episode?.podcast?.hasVideo
      } else {
        const episode = item
        return !episode?.podcast?.hasVideo
      }
    })
  }

  const currentItemIndex = filteredPlaylistItems.findIndex((item: any) => {
    return item.id === episodeOrMediaRefId
  })

  // limit to the nearest 50 ids
  const previousEpisodesAndMediaRefs = filteredPlaylistItems.slice(currentItemIndex - 50, currentItemIndex)
  const nextEpisodesAndMediaRefs = filteredPlaylistItems.slice(currentItemIndex + 1, currentItemIndex + 1 + 50)

  return { previousEpisodesAndMediaRefs, nextEpisodesAndMediaRefs }
}
