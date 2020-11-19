import { getRepository } from 'typeorm'
import { config } from '~/config'
import { Episode, MediaRef } from '~/entities'
import { request } from '~/lib/request'
import { getQueryOrderColumn } from '~/lib/utility'
import { createMediaRef, updateMediaRef } from './mediaRef'
const createError = require('http-errors')
const { superUserId } = config

const relations = [
  'authors', 'categories', 'podcast', 'podcast.feedUrls',
  'podcast.authors', 'podcast.categories'
]

const getEpisode = async id => {
  const repository = getRepository(Episode)
  const episode = await repository.findOne({
    id
  }, { relations })
  
  if (!episode) {
    throw new createError.NotFound('Episode not found')
  } else if (!episode.isPublic) {
    // If a public version of the episode isn't available, check if a newer public version
    // of the episode is available and return that. Don't return the non-public version
    // because it is more likely to contain a dead / out-of-date mediaUrl.
    // Non-public episodes may be attached to old mediaRefs that are still accessible on clip pages.
    const publicEpisode = await repository.findOne({
      isPublic: true,
      podcastId: episode.podcastId,
      title: episode.title
    }, { relations })

    if (publicEpisode) return publicEpisode
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
    } else if (sort === 'most-recent') {
      const date = new Date()
      if (podcastIds.length === 0) {
        date.setDate(date.getDate() - 3)
      } else if (podcastIds.length > 10) {
        date.setMonth(date.getMonth() - 1)
      }
      const dateString = date.toISOString().slice(0, 19).replace('T', ' ')
      qb.andWhere(`episode."pubDate" > '${dateString}'`)
    }
  }

  return qb
}

const getEpisodes = async (query) => {
  const repository = getRepository(Episode)
  const { categories, includePodcast, podcastId, searchAllFieldsText = '', skip, sort, take } = query
  const { sincePubDate } = query

  const podcastIds = podcastId && podcastId.split(',') || []
  const categoriesIds = categories && categories.split(',') || []
  
  let qb = repository
    .createQueryBuilder('episode')
    .select('episode.id', 'id')
    .addSelect('SUBSTR(episode.description, 1, 10000)', 'description')
    .addSelect('episode.duration', 'duration')
    .addSelect('episode.episodeType', 'episodeType')
    .addSelect('episode.funding', 'funding')
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

  const episodeWhereConditions = `
    ${searchAllFieldsText ? 'LOWER(episode.title) LIKE :searchAllFieldsText' : ''}
    ${searchAllFieldsText && podcastIds.length > 0 ? ' AND ' : ''}
    ${podcastIds.length > 0 ? 'episode.podcastId IN (:...podcastIds)' : ''}
    ${sincePubDate && (searchAllFieldsText || podcastIds.length > 0) ? ' AND ' : ''}
    ${sincePubDate ? 'episode.pubDate >= :sincePubDate' : ''}
  `.trim() || 'true'

  let countQB = repository.createQueryBuilder('episode')
    .select('episode.id', 'id')
    .addSelect('episode.title', 'title')
    .addSelect('episode.podcastId', 'podcastId')
    .addSelect('episode.pubDate', 'pubDate')
    .addSelect('episode.isPublic', 'isPublic')
  countQB.where(
    episodeWhereConditions,
    {
      podcastIds,
      searchAllFieldsText: `%${searchAllFieldsText.toLowerCase().trim()}%`,
      sincePubDate
    }
  )
  countQB.andWhere('episode."isPublic" IS true')
  countQB = limitEpisodesQuerySize(countQB, podcastIds, sort)

  if (podcastIds.length > 0) {
    const podcastJoinConditions = 'episode.podcastId IN (:...podcastIds)'

    qb[`${includePodcast ? 'innerJoinAndSelect' : 'innerJoin'}`](
      'episode.podcast',
      'podcast',
      podcastJoinConditions,
      { podcastIds }
    )
  } else if (categoriesIds.length > 0) {
    countQB.innerJoin(
      'episode.podcast',
      'podcast'
    )
    countQB.innerJoin(
      'podcast.categories',
      'categories',
      'categories.id IN (:...categoriesIds)',
      { categoriesIds }
    )

    qb[`${includePodcast ? 'innerJoinAndSelect' : 'innerJoin'}`](
      'episode.podcast',
      'podcast'
    )

    qb.innerJoin(
      'podcast.categories',
      'categories',
      'categories.id IN (:...categoriesIds)',
      { categoriesIds }
    )
  } else {
    qb[`${includePodcast ? 'innerJoinAndSelect' : 'innerJoin'}`](
      'episode.podcast',
      'podcast'
    )
  }

  const count = await countQB.getCount()

  qb.where(
    episodeWhereConditions,
    {
      podcastIds,
      searchAllFieldsText: `%${searchAllFieldsText.toLowerCase().trim()}%`,
      sincePubDate
    }
  )
  qb = limitEpisodesQuerySize(qb, podcastIds, sort)
  qb.andWhere('episode."isPublic" IS true')
  
  if (sincePubDate) {
    qb.offset(0)
    qb.limit(50)

    const orderColumn = getQueryOrderColumn('episode', 'most-recent', 'pubDate')
    qb.orderBy(orderColumn[0], orderColumn[1] as any)

    const episodes = await qb.getRawMany()

    return [episodes, count]
  } else {
    qb.offset(skip)
    qb.limit(take)

    const orderColumn = getQueryOrderColumn('episode', sort, 'pubDate')

    query.sort === 'random' ? qb.orderBy(orderColumn[0]) : qb.orderBy(orderColumn[0], orderColumn[1] as any)

    const episodes = await qb.getRawMany()

    // Limit the description length since we don't need the full description in list views.
    const cleanedEpisodes = episodes.map((x) => {
      x.description = x.description ? x.description.substr(0, 2500) : '';
      return x
    })

    return [cleanedEpisodes, count]
  }
}

const getDeadEpisodes = async () => {
  const repository = getRepository(Episode)

  const qb = repository
    .createQueryBuilder('episode')
    .select('episode.id', 'id')
    .where('episode."isPublic" = FALSE AND mediaRef.id IS NULL')
    .leftJoin(
      'episode.mediaRefs',
      'mediaRef'
    )
    .limit(100)

  const episodes = await qb.getRawMany()
  console.log('dead episode count:', episodes.length)

  return episodes
}

const removeDeadEpisodes = async () => {
  const deadEpisodes = await getDeadEpisodes()
  await removeEpisodes(deadEpisodes)
  await new Promise(r => setTimeout(r, 1000));
  const shouldContinue = deadEpisodes.length === 100
  return shouldContinue
}

const removeEpisodes = async (episodes: any[]) => {
  const repository = getRepository(Episode)
  for (const episode of episodes) {
    await repository.remove(episode)
  }
}

const retrieveLatestChapters = async (id) => {
  const episodeRepository = getRepository(Episode)
  const mediaRefRepository = getRepository(MediaRef)

  const qb = episodeRepository
    .createQueryBuilder('episode')
    .select('episode.id', 'id')
    .addSelect('episode.chaptersUrl', 'chaptersUrl')
    .addSelect('episode.chaptersUrlLastParsed', 'chaptersUrlLastParsed')
    .where('episode.id = :id', { id })

  const episode = await qb.getRawOne() as Episode
  if (!episode) throw new Error('Episode not found') 
  const { chaptersUrl, chaptersUrlLastParsed } = episode

  // Update the latest chapters only once every 12 hours for an episode.
  // If less than 12 hours, then just return the latest chapters from the database.
  const halfDay = new Date().getTime() + (1 * 12 * 60 * 60 * 1000)
  const chaptersUrlLastParsedDate = new Date(chaptersUrlLastParsed).getTime()

  if (chaptersUrl && (!chaptersUrlLastParsed || halfDay < chaptersUrlLastParsedDate)) {
    try {
      await episodeRepository.update(episode.id, { chaptersUrlLastParsed: new Date() })
      const response = await request(chaptersUrl)
      const parsedResponse = JSON.parse(response)
      const { chapters: newChapters } = parsedResponse
      if (newChapters) {
        const qb = mediaRefRepository
          .createQueryBuilder('mediaRef')
          .select('mediaRef.id', 'id')
          .addSelect('mediaRef.isOfficialChapter', 'isOfficialChapter')
          .addSelect('mediaRef.startTime', 'startTime')
          .where('mediaRef.isOfficialChapter = TRUE')
        const existingChapters = await qb.getRawMany()

        // If existing chapter with current chapter's startTime does not exist,
        // then set the existingChapter to isPublic = false.
        const deadChapters = existingChapters.filter(x => {
          return newChapters.every(y => y.startTime !== x.startTime)
        })

        for (const deadChapter of deadChapters) {
          await updateMediaRef({
            ...deadChapter,
            isPublic: false
          }, superUserId)
        }

        for (const newChapter of newChapters) {
          try {
            // If a chapter with that startTime already exists, then update it.
            // If it does not exist, then create a new mediaRef with isOfficialChapter = true.
            const existingChapter = existingChapters.find(x => x.startTime === newChapter.startTime)
            if (existingChapter && existingChapter.id) {
              await updateMediaRef({
                id: existingChapter.id,
                imageUrl: newChapter.img || null,
                isOfficialChapter: true,
                isPublic: true,
                linkUrl: newChapter.url || null,
                startTime: newChapter.startTime,
                title: newChapter.title,
                episodeId: id
              }, superUserId)
            } else {
              await createMediaRef({
                imageUrl: newChapter.img || null,
                isOfficialChapter: true,
                isPublic: true,
                linkUrl: newChapter.url || null,
                startTime: newChapter.startTime,
                title: newChapter.title,
                owner: superUserId,
                episodeId: id
              })
            }
          } catch (error) {
            console.log('retrieveLatestChapters newChapter', error)
          }
        }
      }
    } catch (error) {
      console.log('retrieveLatestChapters request', error)
    }
  }

  const officialChaptersForEpisode = await mediaRefRepository
    .createQueryBuilder('mediaRef')
    .select('mediaRef.id')
    .addSelect('mediaRef.endTime')
    .addSelect('mediaRef.imageUrl')
    .addSelect('mediaRef.isOfficialChapter')
    .addSelect('mediaRef.linkUrl')
    .addSelect('mediaRef.startTime')
    .addSelect('mediaRef.title')
    .where({
      isOfficialChapter: true,
      episode: id
    })
    .orderBy('mediaRef.startTime', 'ASC')
    .getManyAndCount()

  return officialChaptersForEpisode
}

export {
  getEpisode,
  getEpisodes,
  removeDeadEpisodes,
  retrieveLatestChapters
}
