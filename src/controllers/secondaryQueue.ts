import { LessThan, MoreThan, getRepository } from 'typeorm'
import { Episode, Podcast } from '~/entities'
const createError = require('http-errors')

const relations = ['liveItem', 'podcast']

type SecondaryQueueResponseData = {
  previousEpisodes: Episode[]
  nextEpisodes: Episode[]
  inheritedPodcast: Podcast
}

export const getSecondaryQueueEpisodesForPodcastId = async (
  episodeId: string,
  podcastId: string
): Promise<SecondaryQueueResponseData> => {
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
  const take = currentEpisode.podcast.medium === 'music' ? 50 : 5

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
    take
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
    take
  })

  return { previousEpisodes, nextEpisodes, inheritedPodcast }
}
