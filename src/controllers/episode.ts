import { getRepository } from 'typeorm'
import { Episode } from '~/entities'
import { getQueryOrderColumn } from '~/lib/utility'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'mediaRefs', 'podcast'
]

const getEpisode = (id) => {
  const repository = getRepository(Episode)
  const episode = repository.findOne({
    id,
    isPublic: true
  }, { relations })

  if (!episode) {
    throw new createError.NotFound('Episode not found')
  }

  return episode
}

const getEpisodes = async (query, includeNSFW) => {
  const repository = getRepository(Episode)
  const { podcastId, searchAllFieldsText, skip, sort, take } = query
  let podcastIds = podcastId && podcastId.split(',') || []

  const orderColumn = getQueryOrderColumn('episode', sort, 'pubDate')
  includeNSFW = false
  const podcastJoinAndSelect = `
    ${includeNSFW ? 'true' : 'podcast.isExplicit = false'}
    ${podcastIds.length > 0 ? 'AND episode.podcastId IN (:...podcastIds)' : ''}
  `

  let qb = repository
    .createQueryBuilder('episode')
    .innerJoinAndSelect(
      'episode.podcast',
      'podcast',
      podcastJoinAndSelect,
      { podcastIds }
    )

  if (searchAllFieldsText) {
    qb.where(
      `LOWER(episode.title) LIKE :searchAllFieldsText OR
       LOWER(podcast.title) LIKE :searchAllFieldsText`,
       { searchAllFieldsText: `%${searchAllFieldsText.toLowerCase()}%` }
    )
    qb.andWhere('episode."isPublic" = true')
  } else {
    qb.where({ isPublic: true })
  }

  qb.skip(skip)

  // If only searching for one podcast and beyond the first page,
  // then return all remaining episodes.
  if (podcastIds.length !== 1 || parseInt(skip, 10) === 0) {
    qb.take(take)
  }

  const episodes = await qb
    .orderBy(orderColumn, 'DESC')
    .getMany()

  return episodes
}

export {
  getEpisode,
  getEpisodes
}
