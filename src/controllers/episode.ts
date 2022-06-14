import { getConnection, getRepository } from 'typeorm'
import { config } from '~/config'
import { Episode, EpisodeMostRecent, MediaRef } from '~/entities'
import { request } from '~/lib/request'
import { addOrderByToQuery, getManticoreOrderByColumnName, removeAllSpaces } from '~/lib/utility'
import { validateSearchQueryString } from '~/lib/utility/validation'
import { searchApi } from '~/services/manticore'
import { createMediaRef, updateMediaRef } from './mediaRef'
const createError = require('http-errors')
const SqlString = require('sqlstring')
const { superUserId } = config

const relations = [
  'authors',
  'categories',
  'liveItem',
  'podcast',
  'podcast.feedUrls',
  'podcast.authors',
  'podcast.categories'
]

const getEpisode = async (id) => {
  const repository = getRepository(Episode)
  const episode = await repository.findOne(
    {
      id
    },
    { relations }
  )

  if (!episode || !episode.podcast.isPublic) {
    throw new createError.NotFound('Episode not found')
  } else if (!episode.isPublic) {
    // If a public version of the episode isn't available, check if a newer public version
    // of the episode is available and return that.
    // Otherwise, return the non-public version of the episode. Any episode that no longer appears
    // in an RSS feed is marked as isPublic=false, so there is no guarantee that an isPublic=false
    // podcast will still work. The front-end should provide (but doesn't yet) some kind of disclaimer
    // to the user that the non-public episode they are viewing may be out of date and not accessible any more.
    // Also, non-public episodes may be attached to old mediaRefs that are still accessible on clip pages.
    const publicEpisode = await repository.findOne(
      {
        isPublic: true,
        podcastId: episode.podcastId,
        title: episode.title
      },
      { relations }
    )

    return publicEpisode || episode
  }

  return episode
}

// Use where clause to reduce the size of very large data sets and speed up queries
// const limitEpisodesQuerySize = (qb: any, shouldLimit: boolean, sort: string) => {
//   if (shouldLimit) {
//     if (sort === 'most-recent') {
//       const date = new Date()
//       date.setDate(date.getDate() - 1)
//       const dateString = date.toISOString().slice(0, 19).replace('T', ' ')
//       qb.andWhere(`episode."pubDate" > '${dateString}'`)
//     }
//   }

//   return qb
// }

const generateEpisodeSelects = (
  includePodcast,
  searchTitle = '',
  sincePubDate = '',
  hasVideo,
  shouldUseEpisodesMostRecent
) => {
  const table = shouldUseEpisodesMostRecent ? EpisodeMostRecent : Episode
  const qb = getRepository(table)
    .createQueryBuilder('episode')
    .select('episode.id')
    .addSelect('episode.alternateEnclosures')
    .addSelect('episode.chaptersUrl')
    .addSelect('episode.contentLinks')
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
    .addSelect('episode.subtitle')
    .addSelect('episode.title')
    .addSelect('episode.transcript')
    .addSelect('episode.value')

  qb[`${includePodcast ? 'leftJoinAndSelect' : 'leftJoin'}`]('episode.podcast', 'podcast')

  if (!shouldUseEpisodesMostRecent) {
    qb.leftJoinAndSelect('episode.liveItem', 'liveItem')
  }

  // Throws an error if searchTitle is defined but invalid
  if (searchTitle) validateSearchQueryString(searchTitle)

  qb.where(`${searchTitle ? 'LOWER(episode.title) LIKE :searchTitle' : 'true'}`, {
    searchTitle: `%${searchTitle?.toLowerCase().trim()}%`
  })

  if (sincePubDate) {
    qb.andWhere(`episode.pubDate >= :sincePubDate`, { sincePubDate })
  }

  if (hasVideo) {
    qb.andWhere(`episode."mediaType" LIKE 'video%'`)
  }

  if (!shouldUseEpisodesMostRecent) {
    qb.andWhere('"liveItem" IS null')
  }

  return qb
}

// Limit the description length since we don't need the full description in list views.
const cleanEpisodes = (episodes) => {
  return episodes.map((x) => {
    x.description = x.description ? x.description.substr(0, 2500) : ''
    return x
  })
}

const getEpisodesFromSearchEngine = async (query) => {
  const { searchTitle, skip, sort, take } = query

  const { orderByColumnName, orderByDirection } = getManticoreOrderByColumnName(sort)
  const cleanedSearchTitle = removeAllSpaces(searchTitle)
  if (!cleanedSearchTitle) throw new Error('Must provide a searchTitle.')

  const safeSqlString = SqlString.format(
    `
      SELECT *
      FROM idx_episode_dist
      WHERE match(?)
      ORDER BY weight() DESC, ${orderByColumnName} ${orderByDirection}
      LIMIT ?,?
      OPTION ranker=expr('sum(lcs*user_weight)');
  `,
    [cleanedSearchTitle, skip, take]
  )

  const result = await searchApi.sql(safeSqlString)

  let episodeIds = [] as any[]
  const { data, total } = result

  if (Array.isArray(data)) {
    episodeIds = data.map((x: any) => x.podverse_id)
  } else {
    return [[], 0]
  }

  const episodeIdsString = episodeIds.join(',')
  if (!episodeIdsString) return [data, total]

  delete query.searchTitle
  delete query.skip
  query.episodeId = episodeIdsString

  const isFromManticoreSearch = true
  return getEpisodes(query, isFromManticoreSearch, total)
}

const getEpisodes = async (query, isFromManticoreSearch?, totalOverride?) => {
  const { episodeId, hasVideo, includePodcast, searchTitle, sincePubDate, skip, sort, take } = query
  const episodeIds = (episodeId && episodeId.split(',')) || []

  const shouldUseEpisodesMostRecent = false
  const qb = generateEpisodeSelects(includePodcast, searchTitle, sincePubDate, hasVideo, shouldUseEpisodesMostRecent)
  // const shouldLimit = true
  // qb = limitEpisodesQuerySize(qb, shouldLimit, sort)
  qb.andWhere('episode."isPublic" IS true')

  if (episodeIds.length) {
    qb.andWhere('episode.id IN (:...episodeIds)', { episodeIds })
  }

  const shouldLimitCount = true
  const allowRandom = false
  return handleGetEpisodesWithOrdering(
    { qb, query, skip, sort, take },
    allowRandom,
    shouldLimitCount,
    episodeIds,
    isFromManticoreSearch,
    totalOverride
  )
}

const getEpisodesByCategoryIds = async (query) => {
  const { categories, hasVideo, includePodcast, searchTitle, sincePubDate, skip, sort, take } = query
  const categoriesIds = (categories && categories.split(',')) || []

  const shouldUseEpisodesMostRecent = sort === 'most-recent'
  const qb = generateEpisodeSelects(includePodcast, searchTitle, sincePubDate, hasVideo, shouldUseEpisodesMostRecent)

  qb.innerJoin('podcast.categories', 'categories', 'categories.id IN (:...categoriesIds)', { categoriesIds })

  // const shouldLimit = true
  // qb = limitEpisodesQuerySize(qb, shouldLimit, sort)
  qb.andWhere('episode."isPublic" IS true')

  const allowRandom = true
  const shouldLimitCount = true
  return handleGetEpisodesWithOrdering({ qb, query, skip, sort, take }, allowRandom, shouldLimitCount)
}

const getEpisodesByPodcastId = async (query, qb, podcastIds) => {
  const { skip, sort, take } = query
  qb.andWhere('episode.podcastId IN(:...podcastIds)', { podcastIds })
  qb.andWhere('episode."isPublic" IS true')

  const allowRandom = true
  const shouldLimitCount = false
  return handleGetEpisodesWithOrdering({ qb, query, skip, sort, take }, allowRandom, shouldLimitCount)
}

const getEpisodesByPodcastIds = async (query) => {
  const { hasVideo, includePodcast, podcastId, searchTitle, sincePubDate, skip, sort, take } = query
  const podcastIds = (podcastId && podcastId.split(',')) || []

  const shouldUseEpisodesMostRecent = podcastIds.length > 1 && sort === 'most-recent'
  const qb = generateEpisodeSelects(includePodcast, searchTitle, sincePubDate, hasVideo, shouldUseEpisodesMostRecent)

  if (podcastIds.length === 1) {
    return getEpisodesByPodcastId(query, qb, podcastIds)
  }

  qb.andWhere('episode.podcastId IN(:...podcastIds)', { podcastIds })
  qb.andWhere('episode."isPublic" IS true')

  const allowRandom = true
  const shouldLimitCount = shouldUseEpisodesMostRecent
  return handleGetEpisodesWithOrdering({ qb, skip, sort, take }, allowRandom, shouldLimitCount)
}

const handleGetEpisodesWithOrdering = async (
  obj,
  allowRandom,
  shouldLimitCount,
  episodeIds?,
  isFromManticoreSearch?,
  totalOverride?
) => {
  const { skip, sort, take } = obj
  let { qb } = obj
  qb.offset(skip)
  qb.limit(take)

  qb = addOrderByToQuery(qb, 'episode', sort, 'pubDate', allowRandom, isFromManticoreSearch)

  let episodes = [] as any
  let episodesCount = 0
  if (shouldLimitCount) {
    const results = await qb.offset(skip).limit(take).getMany()
    episodes = results
    episodesCount = 10000
  } else {
    const results = await qb.offset(skip).limit(take).getManyAndCount()
    episodes = results[0] || []
    episodesCount = results[1] || 0
  }

  if (totalOverride) {
    episodesCount = totalOverride
  }

  if (episodeIds?.length && isFromManticoreSearch) {
    episodes.sort(function (e1, e2) {
      return episodeIds.indexOf(e1.id) - episodeIds.indexOf(e2.id)
    })
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
    .leftJoin('episode.mediaRefs', 'mediaRef')
    .where('episode.id IN (' + subQueryEpisodesIsPublicFalse.getQuery() + ')')
    .andWhere('mediaRef.id IS NULL')

  const episodes = await qb.getRawMany()
  console.log('dead episode count:', episodes.length)

  return episodes
}

const removeDeadEpisodes = async () => {
  console.log('removeDeadEpisodes')
  const deadEpisodes = await getDeadEpisodes()
  await removeEpisodes(deadEpisodes)
  await new Promise((r) => setTimeout(r, 1000))
  // const shouldContinue = deadEpisodes.length === 100
  return false
}

const removeEpisodes = async (episodes: any[]) => {
  const repository = getRepository(Episode)
  for (const episode of episodes) {
    console.log('removeEpisode', episode)
    await new Promise((r) => setTimeout(r, 25))
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

  const episode = (await qb.getRawOne()) as Episode
  if (!episode) throw new Error('Episode not found')
  const { chaptersUrl, chaptersUrlLastParsed } = episode

  /* Run chapters update logic in the background, since it can take 30+ seconds to iterate through. */
  ;(async function () {
    // Update the latest chapters only once every 1 hour for an episode.
    // If less than 1 hours, then just return the latest chapters from the database.
    const halfDay = new Date().getTime() - 1 * 1 * 60 * 60 * 1000 // days hours minutes seconds milliseconds
    const chaptersUrlLastParsedDate = new Date(chaptersUrlLastParsed).getTime()

    if (chaptersUrl && (!chaptersUrlLastParsed || halfDay > chaptersUrlLastParsedDate)) {
      try {
        await episodeRepository.update(episode.id, { chaptersUrlLastParsed: new Date() })
        const response = await request(chaptersUrl)
        const trimmedResponse = (response && response.trim()) || {}
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
              episode: episode.id,
              isPublic: true
            })
          const existingChapters = await qb.getRawMany()

          // If existing chapter with current chapter's startTime does not exist,
          // then set the existingChapter to isPublic = false.
          const deadChapters = existingChapters.filter((x) => {
            return newChapters.every((y) => y.startTime !== x.startTime)
          })

          for (const deadChapter of deadChapters) {
            await updateMediaRef(
              {
                ...deadChapter,
                isPublic: false
              },
              superUserId
            )
          }

          for (const newChapter of newChapters) {
            try {
              const startTime = Math.round(newChapter.startTime)
              // If a chapter with that startTime already exists, then update it.
              // If it does not exist, then create a new mediaRef with isOfficialChapter = true.
              const existingChapter = existingChapters.find((x) => x.startTime === startTime)
              if (existingChapter && existingChapter.id) {
                await updateMediaRef(
                  {
                    id: existingChapter.id,
                    imageUrl: newChapter.img || null,
                    isOfficialChapter: true,
                    isPublic: true,
                    linkUrl: newChapter.url || null,
                    startTime,
                    title: newChapter.title,
                    episodeId: id
                  },
                  superUserId
                )
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
  })()

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
      episode: id,
      isPublic: true
    })
    .orderBy('mediaRef.startTime', 'ASC')
    .getManyAndCount()

  return officialChaptersForEpisode
}

const refreshEpisodesMostRecentMaterializedView = async () => {
  const em = await getConnection().createEntityManager()
  await em.query('REFRESH MATERIALIZED VIEW CONCURRENTLY "episodes_most_recent"')
}

export {
  getEpisode,
  getEpisodes,
  getEpisodesByCategoryIds,
  getEpisodesByPodcastIds,
  getEpisodesFromSearchEngine,
  refreshEpisodesMostRecentMaterializedView,
  removeDeadEpisodes,
  retrieveLatestChapters
}
