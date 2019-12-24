import { getRepository } from 'typeorm'
import { Episode } from '~/entities'
import { getQueryOrderColumn } from '~/lib/utility'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'mediaRefs', 'podcast',
  'podcast.authors', 'podcast.categories'
]

const getEpisode = async id => {
  const repository = getRepository(Episode)
  const episode = await repository.findOne({
    id,
    isPublic: true
  }, { relations })

  if (!episode) {
    throw new createError.NotFound('Episode not found')
  }

  return episode
}

// Use where clause to reduce the size of very large data sets and speed up queries
const limitEpisodesQuerySize = (qb: any, podcastIds: any[], sort: string) => {
  if (!podcastIds || podcastIds.length === 0 || podcastIds.length > 10) {
    if (sort === 'top-past-hour') {
      qb.andWhere('episode."pastHourTotalUniquePageviews" > 0')
    } else if (sort === 'top-past-day') {
      qb.andWhere('episode."pastDayTotalUniquePageviews" > 0')
    } else if (sort === 'top-past-week') {
      qb.andWhere('episode."pastWeekTotalUniquePageviews" > 0')
    } else if (sort === 'top-past-month') {
      qb.andWhere('episode."pastMonthTotalUniquePageviews" > 0')
    } else if (sort === 'top-past-year') {
      qb.andWhere('episode."pastYearTotalUniquePageviews" > 0')
    } else if (sort === 'top-all-time') {
      qb.andWhere('episode."pastAllTimeTotalUniquePageviews" > 0')
    } else if (sort === 'most-recent' || sort === 'most-recent-all') {
      const date = new Date()
      date.setMonth(date.getMonth() - 3)
      const dateString = date.toISOString().slice(0, 19).replace('T', ' ')
      qb.andWhere(`episode."pubDate" > '${dateString}'`)
    }
  }

  return qb
}

const getEpisodes = async (query, includeNSFW) => {
  const repository = getRepository(Episode)
  const { includePodcast, podcastId, searchAllFieldsText = '', skip, sort, take } = query
  const { sincePubDate } = query

  const podcastIds = podcastId && podcastId.split(',') || []
  const podcastJoinConditions = `
    ${includeNSFW ? 'true' : 'podcast.isExplicit = false'}
    ${podcastIds.length > 0 ? 'AND episode.podcastId IN (:...podcastIds)' : ''}
  `

  // the names of these whereConditions make no sense :(
  const episodeWhereConditions = `
    LOWER(episode.title) LIKE :searchAllFieldsText
    ${podcastIds.length > 0 ? 'AND episode.podcastId IN (:...podcastIds)' : ''}
    ${sincePubDate ? 'AND episode.pubDate >= :sincePubDate' : ''}
  `

  const episodeWhereSincePubDateConditions = `
    ${podcastIds.length > 0 ? 'episode.podcastId IN (:...podcastIds)' : ''}
    ${sincePubDate ? `${podcastIds.length > 0 ? 'AND ' : ''}episode.pubDate >= :sincePubDate` : ''}
  `

  // Is there a better way to do this? I'm not sure how to get the count
  // with getRawMany...
  let countQB = repository
    .createQueryBuilder('episode')
  if (searchAllFieldsText || sincePubDate) {
    countQB.where(
      sincePubDate ? episodeWhereSincePubDateConditions : episodeWhereConditions,
      {
        podcastIds,
        searchAllFieldsText: `%${searchAllFieldsText.toLowerCase().trim()}%`,
        sincePubDate
      }
    )
    countQB.andWhere('episode."isPublic" IS true')
  } else {
    if (podcastIds.length > 0) {
      countQB.where(
        episodeWhereSincePubDateConditions,
        { podcastIds }
      )
      countQB.andWhere('episode."isPublic" IS true')
    } else {
      countQB.where({ isPublic: true })
    }
    countQB = limitEpisodesQuerySize(countQB, podcastIds, sort)
  }

  const count = await countQB.getCount()

  let qb = repository
    .createQueryBuilder('episode')
    .select('episode.id', 'id')
    .addSelect('SUBSTR(episode.description, 1, 10000)', 'description')
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
        searchAllFieldsText: `%${searchAllFieldsText.toLowerCase().trim()}%`
      }
    )
  } else if (sincePubDate) {
    if (podcastIds.length === 0) return [[], 0]

    qb.where(
      episodeWhereSincePubDateConditions,
      {
        podcastIds,
        sincePubDate
      }
    )
  } else {
    qb = limitEpisodesQuerySize(qb, podcastIds, sort)
  }

  qb.andWhere('episode."isPublic" IS true')

  if (sincePubDate) {
    qb.offset(0)
    qb.limit(50)

    const orderColumn = getQueryOrderColumn('episode', 'most-recent', 'pubDate')
    const episodes = await qb
      
      .orderBy(orderColumn[0], orderColumn[1] as any)
      .getRawMany()

    return [episodes, count]
  } else {
    if (sort !== 'most-recent-all' || podcastIds.length > 1 || podcastIds.length === 0) {
      qb.offset(skip)
      qb.limit(take)
    }

    const orderColumn = getQueryOrderColumn('episode', sort, 'pubDate')
    
    query.sort === 'random' ? qb.orderBy(orderColumn[0]) : qb.orderBy(orderColumn[0], orderColumn[1] as any)
    const episodes = await qb.getRawMany()

    return [episodes, count]
  }
}

export {
  getEpisode,
  getEpisodes
}
