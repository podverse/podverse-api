import { getRepository } from 'typeorm'
import { config } from '~/config'
import { Episode, MediaRef, RecentEpisodeByCategory, RecentEpisodeByPodcast } from '~/entities'
import { request } from '~/lib/request'
import { addOrderByToQuery } from '~/lib/utility'
import { validateSearchQueryString } from '~/lib/utility/validation'
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
const limitEpisodesQuerySize = (qb: any, shouldLimit: boolean, sort: string) => {
  if (shouldLimit) {
    const topSorts = ['top-past-hour', 'top-past-day', 'top-past-week', 'top-past-month', 'top-past-year', 'top-all-time']
    if (topSorts.includes(sort)) {
      qb.andWhere('episode."pastAllTimeTotalUniquePageviews" > 0')
    } else if (sort === 'most-recent') {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      const dateString = date.toISOString().slice(0, 19).replace('T', ' ')
      qb.andWhere(`episode."pubDate" > '${dateString}'`)
    }
  }

  return qb
}

const generateEpisodeSelects = (includePodcast, searchAllFieldsText = '', sincePubDate = '', hasVideo) => {
  const qb = getRepository(Episode)
    .createQueryBuilder('episode')
    .select('episode.id')
    .addSelect('episode.chaptersUrl')
    .addSelect('episode.credentialsRequired')
    .addSelect('episode.description')
    .addSelect('episode.duration')
    .addSelect('episode.episodeType')
    .addSelect('episode.funding')
    .addSelect('episode.guid')
    .addSelect('episode.imageUrl')
    .addSelect('episode.isExplicit')
    .addSelect('episode.isPublic')
    .addSelect('episode.linkUrl')
    .addSelect('episode.mediaFilesize')
    .addSelect('episode.mediaType')
    .addSelect('episode.mediaUrl')
    .addSelect('episode.pastHourTotalUniquePageviews')
    .addSelect('episode.pastDayTotalUniquePageviews')
    .addSelect('episode.pastWeekTotalUniquePageviews')
    .addSelect('episode.pastMonthTotalUniquePageviews')
    .addSelect('episode.pastYearTotalUniquePageviews')
    .addSelect('episode.pastAllTimeTotalUniquePageviews')
    .addSelect('episode.pubDate')
    .addSelect('episode.socialInteraction')
    .addSelect('episode.title')
    .addSelect('episode.transcript')
    .addSelect('episode.value')

  qb[`${includePodcast ? 'leftJoinAndSelect' : 'leftJoin'}`](
    'episode.podcast',
    'podcast'
  )
  
  // Throws an error if searchAllFieldsText is defined but invalid
  if (searchAllFieldsText) validateSearchQueryString(searchAllFieldsText)

  qb.where(
    `${searchAllFieldsText ? 'LOWER(episode.title) LIKE :searchAllFieldsText' : 'true'}`,
    {
      searchAllFieldsText: `%${searchAllFieldsText.toLowerCase().trim()}%`
    }
  )
  
  if (sincePubDate) {
    qb.andWhere(`episode.pubDate >= :sincePubDate`, { sincePubDate })
  }

  if (hasVideo) {
    qb.andWhere(`episode."mediaType" LIKE 'video%'`)
  }

  return qb    
}

// Limit the description length since we don't need the full description in list views.
const cleanEpisodes = (episodes) => {
  return episodes.map((x) => {
    x.description = x.description ? x.description.substr(0, 2500) : '';
    return x
  })
}

const getEpisodes = async (query) => {
  const { hasVideo, includePodcast, searchAllFieldsText, sincePubDate, skip, sort, take } = query

  let qb = generateEpisodeSelects(includePodcast, searchAllFieldsText, sincePubDate, hasVideo)
  const shouldLimit = true
  qb = limitEpisodesQuerySize(qb, shouldLimit, sort)
  qb.andWhere('episode."isPublic" IS true')

  const shouldLimitCount = true
  const allowRandom = false
  return handleGetEpisodesWithOrdering({ qb, query, skip, sort, take }, allowRandom, shouldLimitCount)
}

const getEpisodesByCategoryIds = async (query) => {
  const { categories, hasVideo, includePodcast, searchAllFieldsText, sincePubDate, skip, sort, take } = query
  const categoriesIds = categories && categories.split(',') || []

  let qb = generateEpisodeSelects(includePodcast, searchAllFieldsText, sincePubDate, hasVideo)

  if (sort === 'most-recent') {
    return handleMostRecentEpisodesQuery(qb, 'categoriesIds', categoriesIds, skip, take)
  } else {
    qb.innerJoin(
      'podcast.categories',
      'categories',
      'categories.id IN (:...categoriesIds)',
      { categoriesIds }
    )

    const shouldLimit = true
    qb = limitEpisodesQuerySize(qb, shouldLimit, sort)
    qb.andWhere('episode."isPublic" IS true')

    const allowRandom = true
    const shouldLimitCount = true
    return handleGetEpisodesWithOrdering({ qb, query, skip, sort, take }, allowRandom, shouldLimitCount)
  }
}

const getEpisodesByPodcastId = async (query, qb, podcastIds) => {
  const { skip, sort, take } = query
  qb.andWhere('episode.podcastId IN(:...podcastIds)', { podcastIds })
  qb.andWhere('episode."isPublic" IS true')

  const shouldLimitCount = false
  const allowRandom = true
  return handleGetEpisodesWithOrdering({ qb, query, skip, sort, take }, allowRandom, shouldLimitCount)
}

const getEpisodesByPodcastIds = async (query) => {
  const { hasVideo, includePodcast, podcastId, searchAllFieldsText, sincePubDate, skip, sort, take } = query
  const podcastIds = podcastId && podcastId.split(',') || []

  let qb = generateEpisodeSelects(includePodcast, searchAllFieldsText, sincePubDate, hasVideo)

  if (podcastIds.length === 1) {
    return getEpisodesByPodcastId(query, qb, podcastIds)
  }

  if (sort === 'most-recent' && !hasVideo) {
    return handleMostRecentEpisodesQuery(qb, 'podcastIds', podcastIds, skip, take)
  } else {
    qb.andWhere('episode.podcastId IN(:...podcastIds)', { podcastIds })
    const shouldLimit = podcastIds.length > 10
    qb = limitEpisodesQuerySize(qb, shouldLimit, sort)
    qb.andWhere('episode."isPublic" IS true')

    const allowRandom = true
    return handleGetEpisodesWithOrdering({ qb, query, skip, sort, take }, allowRandom, shouldLimit)
  }
}

const handleMostRecentEpisodesQuery = async (qb, type, ids, skip, take) => {
  const table = type === 'categoriesIds' ? RecentEpisodeByCategory : RecentEpisodeByPodcast
  const select = type === 'categoriesIds' ? 'recentEpisode.categoryId' : 'recentEpisode.podcastId'
  const where = type === 'categoriesIds' ? 'recentEpisode.categoryId IN (:...ids)' : 'recentEpisode.podcastId IN (:...ids)'

  const recentEpisodesResult = await getRepository(table)
    .createQueryBuilder('recentEpisode')
    .select('recentEpisode.episodeId')
    .addSelect(select)
    .addSelect('recentEpisode.pubDate')
    .where(where, { ids })
    .orderBy('recentEpisode.pubDate', 'DESC')
    .offset(skip)
    .limit(take)
    .getManyAndCount()

  const totalCount = recentEpisodesResult[1]
  if (!totalCount) return [[], 0]

  const recentEpisodeIds = recentEpisodesResult[0].map(x => x.episodeId)
  if (recentEpisodeIds.length <= 0) return [[], totalCount]

  qb.andWhere('episode.id IN (:...recentEpisodeIds)', { recentEpisodeIds })
  const allowRandom = false
  qb = addOrderByToQuery(qb, 'episode', 'most-recent', 'pubDate', allowRandom)
  
  const episodes = await qb.getMany()
  const cleanedEpisodes = cleanEpisodes(episodes)
  return [cleanedEpisodes, totalCount]
}

const handleGetEpisodesWithOrdering = async (obj, allowRandom, shouldLimitCount) => {
  const { skip, sort, take } = obj
  let { qb } = obj
  qb.offset(skip)
  qb.limit(take)

  qb = addOrderByToQuery(qb, 'episode', sort, 'pubDate', allowRandom)

  let episodes = [] as any
  let episodesCount = 0

  if (shouldLimitCount) {
    const results = await qb
      .offset(skip)
      .limit(take)
      .getMany()
    episodes = results
    episodesCount = 10000
  } else {
    const results = await qb
      .offset(skip)
      .limit(take)
      .getManyAndCount()
    episodes = results[0] || []
    episodesCount = results[1] || 0
  }

  const cleanedEpisodes = cleanEpisodes(episodes)

  return [cleanedEpisodes, episodesCount]
}

const getDeadEpisodes = async () => {
  const repository = getRepository(Episode)

  const subQueryEpisodesIsPublicFalse = repository
    .createQueryBuilder('episode')
    .select('episode.id', 'id')
    .where('episode."isPublic" = FALSE')

  const qb = repository
    .createQueryBuilder('episode')
    .select('episode.id', 'id')
    .leftJoin(
      'episode.mediaRefs',
      'mediaRef'
    )
    .where("episode.id IN (" + subQueryEpisodesIsPublicFalse.getQuery() + ")")
    .andWhere('mediaRef.id IS NULL')

  const episodes = await qb.getRawMany()
  console.log('dead episode count:', episodes.length)

  return episodes
}

const removeDeadEpisodes = async () => {
  console.log('removeDeadEpisodes')
  const deadEpisodes = await getDeadEpisodes()
  await removeEpisodes(deadEpisodes)
  await new Promise(r => setTimeout(r, 1000));
  // const shouldContinue = deadEpisodes.length === 100
  return false
}

const removeEpisodes = async (episodes: any[]) => {
  const repository = getRepository(Episode)
  for (const episode of episodes) {
    console.log('removeEpisode', episode)
    await new Promise(r => setTimeout(r, 25));
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

  // Update the latest chapters only once every 1 hour for an episode.
  // If less than 1 hours, then just return the latest chapters from the database.
  const halfDay = new Date().getTime() - (1 * 1 * 60 * 60 * 1000) // days hours minutes seconds milliseconds
  const chaptersUrlLastParsedDate = new Date(chaptersUrlLastParsed).getTime()

  if (chaptersUrl && (!chaptersUrlLastParsed || halfDay > chaptersUrlLastParsedDate)) {
    try {
      await episodeRepository.update(episode.id, { chaptersUrlLastParsed: new Date() })
      const response = await request(chaptersUrl)
      const trimmedResponse = response && response.trim() || {}
      const parsedResponse = JSON.parse(trimmedResponse)
      const { chapters: newChapters } = parsedResponse

      if (newChapters) {
        const qb = mediaRefRepository
          .createQueryBuilder('mediaRef')
          .select('mediaRef.id', 'id')
          .addSelect('mediaRef.isOfficialChapter', 'isOfficialChapter')
          .addSelect('mediaRef.startTime', 'startTime')
          .where({
            isOfficialChapter: true,
            episode: episode.id
          })
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
            const startTime = Math.round(newChapter.startTime)
            // If a chapter with that startTime already exists, then update it.
            // If it does not exist, then create a new mediaRef with isOfficialChapter = true.
            const existingChapter = existingChapters.find(x => x.startTime === startTime)
            if (existingChapter && existingChapter.id) {
              await updateMediaRef({
                id: existingChapter.id,
                imageUrl: newChapter.img || null,
                isOfficialChapter: true,
                isPublic: true,
                linkUrl: newChapter.url || null,
                startTime,
                title: newChapter.title,
                episodeId: id
              }, superUserId)
            } else {
              await createMediaRef({
                imageUrl: newChapter.img || null,
                isOfficialChapter: true,
                isPublic: true,
                linkUrl: newChapter.url || null,
                startTime,
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
  getEpisodesByCategoryIds,
  getEpisodesByPodcastIds,
  removeDeadEpisodes,
  retrieveLatestChapters
}
