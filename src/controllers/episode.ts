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
  const { includePodcast, podcastId, searchAllFieldsText, skip, sort,
    take } = query
  let podcastIds = podcastId && podcastId.split(',') || []

  const orderColumn = getQueryOrderColumn('episode', sort, 'pubDate')
  const podcastJoinConditions = `
    ${includeNSFW ? 'true' : 'podcast.isExplicit = false'}
    ${podcastIds.length > 0 ? 'AND episode.podcastId IN (:...podcastIds)' : ''}
  `

  const episodeWhereConditions = `
    LOWER(episode.title) LIKE :searchAllFieldsText
    ${podcastIds.length > 0 ? 'AND episode.podcastId IN (:...podcastIds)' : ''}
  `

  // Is there a better way to do this? I'm not sure how to get the count
  // with getRawMany...
  let countQB = repository
    .createQueryBuilder('episode')
  if (searchAllFieldsText) {
    countQB.where(
      episodeWhereConditions,
      {
        podcastIds,
        searchAllFieldsText: `%${searchAllFieldsText.toLowerCase()}%`
      }
    )
    countQB.andWhere('episode."isPublic" = true')
  } else {
    countQB.where({ isPublic: true })
  }

  const count = await countQB.getCount()

  let qb = repository
    .createQueryBuilder('episode')
    .select('episode.id', 'id')
    .addSelect('SUBSTR(episode.description, 1, 500)', 'description')
    .addSelect('episode.duration', 'duration')
    .addSelect('episode.episodeType', 'episodeType')
    .addSelect('episode.guid', 'guid')
    .addSelect('episode.imageUrl', 'imageUrl')
    .addSelect('episode.isExplicit', 'isExplicit')
    .addSelect('episode.isPublic', 'isPublic')
    .addSelect('episode.linkUrl', 'linkUrl')
    .addSelect('episode.mediaFilesize', 'mediaFilesize')
    .addSelect('episode.mediaType', 'mediaType')
    .addSelect('episode.mediaUrl', 'mediaUrl')
    .addSelect('episode.pastHourTotalUniquePageviews', 'pastHourTotalUniquePageviews')
    .addSelect('episode.pastDayTotalUniquePageviews', 'pastDayTotalUniquePageviews')
    .addSelect('episode.pastWeekTotalUniquePageviews', 'pastWeekTotalUniquePageviews')
    .addSelect('episode.pastMonthTotalUniquePageviews', 'pastMonthTotalUniquePageviews')
    .addSelect('episode.pastYearTotalUniquePageviews', 'pastYearTotalUniquePageviews')
    .addSelect('episode.pastAllTimeTotalUniquePageviews', 'pastAllTimeTotalUniquePageviews')
    .addSelect('episode.pubDate', 'pubDate')
    .addSelect('episode.title', 'title')

  if (includePodcast) {
    qb.innerJoinAndSelect(
      'episode.podcast',
      'podcast',
      podcastJoinConditions,
      { podcastIds }
    )
  } else {
    qb.innerJoin(
      'episode.podcast',
      'podcast',
        podcastJoinConditions,
      { podcastIds }
    )
  }

  if (searchAllFieldsText) {
    qb.where(
      episodeWhereConditions,
      {
        podcastIds,
        searchAllFieldsText: `%${searchAllFieldsText.toLowerCase()}%`
      }
    )
    qb.andWhere('episode."isPublic" = true')
  } else {
    qb.where({ isPublic: true })
  }

  qb.offset(skip)
  qb.limit(take)

  const episodes = await qb
    .orderBy(orderColumn, 'DESC')
    .getRawMany()

  return [episodes, count]
}

export {
  getEpisode,
  getEpisodes
}
