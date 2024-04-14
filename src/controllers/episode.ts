import { getConnection, getRepository } from 'typeorm'
import { config } from '~/config'
import { Episode, EpisodeMostRecent, MediaRef, Podcast } from '~/entities'
import { request } from '~/lib/request'
import { addOrderByToQuery, getManticoreOrderByColumnName, removeAllSpaces } from '~/lib/utility'
import { validateSearchQueryString } from '~/lib/utility/validation'
import { manticoreWildcardSpecialCharacters, searchApi } from '~/services/manticore'
import { liveItemStatuses } from './liveItem'
import { createMediaRef, updateMediaRef } from './mediaRef'
import { getPodcast, getPodcastByPodcastGuid } from './podcast'
import { getLightningKeysendValueItem } from 'podverse-shared'
const createError = require('http-errors')
const SqlString = require('sqlstring')
import { v5 as uuidv5, NIL as uuidNIL } from 'uuid'

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

const maxResultsEpisodes = 5000

const getEpisode = async (id) => {
  const repository = getRepository(Episode)
  const episode = await repository.findOne(
    {
      id
    },
    { relations }
  )

  const isEndedLivestream = episode?.liveItem?.status === 'ended'

  if (!isEndedLivestream && (!episode || !episode.podcast.isPublic)) {
    throw new createError.NotFound('Episode not found')
  } else if (!isEndedLivestream && episode && !episode.isPublic) {
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

const getEpisodeByPodcastIdAndGuid = async (podcastId: string, guid: string) => {
  const repository = getRepository(Episode)
  const episode = await repository.findOne(
    {
      guid,
      podcastId
    },
    { relations }
  )

  if (!episode || !episode.podcast.isPublic) {
    throw new createError.NotFound('Episode not found')
  }

  return episode
}

const getEpisodeByPodcastIdAndMediaUrl = async (podcastId: string, mediaUrl: string) => {
  const repository = getRepository(Episode)
  const episode = await repository.findOne(
    {
      mediaUrl,
      podcastId
    },
    { relations }
  )

  if (!episode || !episode.podcast.isPublic) {
    throw new createError.NotFound('Episode not found')
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

const addSelectsToQueryBuilder = (qb) => {
  return qb
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
    .addSelect('episode.itunesEpisode')
    .addSelect('episode.itunesEpisodeType')
    .addSelect('episode.itunesSeason')
    .addSelect('episode.linkUrl')
    .addSelect('episode.mediaFilesize')
    .addSelect('episode.mediaType')
    .addSelect('episode.mediaUrl')
    .addSelect('episode.pubDate')
    .addSelect('episode.socialInteraction')
    .addSelect('episode.subtitle')
    .addSelect('episode.title')
    .addSelect('episode.transcript')
    .addSelect('episode.value')
    .addSelect('episode.createdAt')
}

const generateEpisodeSelects = (
  includePodcast,
  searchTitle = '',
  sincePubDate = '',
  hasVideo,
  shouldUseEpisodesMostRecent,
  liveItemStatus,
  isMusic,
  podcastsOnly
) => {
  const table = shouldUseEpisodesMostRecent ? EpisodeMostRecent : Episode

  let qb = getRepository(table).createQueryBuilder('episode')
  qb = addSelectsToQueryBuilder(qb)

  if (liveItemStatus && !liveItemStatuses.includes(liveItemStatus)) {
    throw new Error('Invalid liveItemStatus')
  }

  qb[`${includePodcast ? 'leftJoinAndSelect' : 'leftJoin'}`]('episode.podcast', 'podcast')

  if (!shouldUseEpisodesMostRecent || liveItemStatus) {
    qb.leftJoinAndSelect('episode.liveItem', 'liveItem')
  }

  // Throws an error if searchTitle is defined but invalid
  if (searchTitle) validateSearchQueryString(searchTitle)

  qb.where(`${searchTitle ? 'LOWER(episode.title) LIKE :searchTitle' : 'true'}`, {
    searchTitle: `%${searchTitle?.toLowerCase().trim()}%`
  })

  if (liveItemStatus === 'live') {
    // do nothing
  } else if (liveItemStatus === 'pending') {
    const todayDateEarlier = new Date(new Date().setDate(new Date().getDate() - 1))
    const todayDateLater = new Date(new Date().setDate(new Date().getDate() + 30))
    qb.andWhere(`liveItem.start >= :todayDateEarlier`, { todayDateEarlier })
    qb.andWhere(`liveItem.start <= :todayDateLater`, { todayDateLater })
  } else if (liveItemStatus === 'ended') {
    const todayDateEarlier = new Date(new Date().setDate(new Date().getDate() - 30))
    qb.andWhere(`liveItem.start >= :todayDateEarlier`, { todayDateEarlier })
  } else if (sincePubDate) {
    qb.andWhere(`episode.createdAt >= :sincePubDate`, { sincePubDate })
    const sincePubDate7DaysEarlier = new Date(sincePubDate)
    sincePubDate7DaysEarlier.setDate(sincePubDate7DaysEarlier.getDate() - 7)
    qb.andWhere(`episode.pubDate >= :sincePubDate7DaysEarlier`, { sincePubDate7DaysEarlier })
  }

  if (hasVideo) {
    qb.andWhere(`episode."mediaType" LIKE 'video%'`)
  }

  if (isMusic) {
    qb.andWhere(`podcast.medium = 'music'`)
  }

  if (podcastsOnly) {
    qb.andWhere(`(podcast.medium = 'podcast' OR podcast."hasVideo" IS true)`)
  }

  if (liveItemStatus) {
    qb.andWhere('"liveItem" IS NOT null AND "liveItem".status = :liveItemStatus', { liveItemStatus })
  } else if (!shouldUseEpisodesMostRecent) {
    qb.andWhere('"liveItem" IS null')
  }

  qb.andWhere('podcast.isPublic IS true')

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
  const titleWithWildcards = manticoreWildcardSpecialCharacters(cleanedSearchTitle)

  const safeSqlString = SqlString.format(
    `
      SELECT *
      FROM idx_episode_dist
      WHERE match(?)
      ORDER BY weight() DESC, ${orderByColumnName} ${orderByDirection}
      LIMIT ?,?
      OPTION ranker=expr('sum(lcs*user_weight)');
  `,
    [titleWithWildcards, skip, take]
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
  const {
    episodeId,
    hasVideo,
    includePodcast,
    isMusic,
    liveItemStatus,
    podcastsOnly,
    searchTitle,
    sincePubDate,
    skip,
    sort,
    take
  } = query
  const episodeIds = (episodeId && episodeId.split(',')) || []

  const shouldUseEpisodesMostRecent = false
  const qb = generateEpisodeSelects(
    includePodcast,
    searchTitle,
    sincePubDate,
    hasVideo,
    shouldUseEpisodesMostRecent,
    liveItemStatus,
    isMusic,
    podcastsOnly
  )
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
  const {
    categories,
    hasVideo,
    includePodcast,
    isMusic,
    liveItemStatus,
    podcastsOnly,
    searchTitle,
    sincePubDate,
    skip,
    sort,
    take
  } = query
  const categoriesIds = (categories && categories.split(',')) || []

  const shouldUseEpisodesMostRecent = sort === 'most-recent'
  const qb = generateEpisodeSelects(
    includePodcast,
    searchTitle,
    sincePubDate,
    hasVideo,
    shouldUseEpisodesMostRecent,
    liveItemStatus,
    isMusic,
    podcastsOnly
  )

  qb.innerJoin('podcast.categories', 'categories', 'categories.id IN (:...categoriesIds)', { categoriesIds })

  // const shouldLimit = true
  // qb = limitEpisodesQuerySize(qb, shouldLimit, sort)
  qb.andWhere('episode."isPublic" IS true')

  const allowRandom = true
  const shouldLimitCount = true
  return handleGetEpisodesWithOrdering({ qb, query, skip, sort, take }, allowRandom, shouldLimitCount)
}

const getEpisodesByPodcastId = async (query, qb, podcastIds) => {
  const { maxResults, skip, sort, take } = query
  qb.andWhere('episode.podcastId IN(:...podcastIds)', { podcastIds })
  qb.andWhere('episode."isPublic" IS true')

  const allowRandom = true
  const shouldLimitCount = false
  return handleGetEpisodesWithOrdering({ qb, query, skip, sort, take, maxResults }, allowRandom, shouldLimitCount)
}

// When a podcast has seasons AND serial, we always return all the episodes,
// and in the order the podcaster intended.
// If the podcast has serial type, then return in chronological order
// instead of the default most-recent order.
const getEpisodesByPodcastIdWithSeasons = async ({
  searchTitle,
  sincePubDate,
  hasVideo,
  itunesFeedType,
  podcastId,
  isMusic,
  podcastsOnly
}) => {
  const includePodcast = false
  const shouldUseEpisodesMostRecent = false
  const liveItemStatus = null
  const qb = generateEpisodeSelects(
    includePodcast,
    searchTitle,
    sincePubDate,
    hasVideo,
    shouldUseEpisodesMostRecent,
    liveItemStatus,
    isMusic,
    podcastsOnly
  )

  const isSerial = itunesFeedType === 'serial'
  const sort = isSerial ? 'oldest' : 'most-recent'
  const seasonsQuery = {
    podcastId,
    maxResults: maxResultsEpisodes,
    searchTitle,
    sort
  }

  const resultsArray = await getEpisodesByPodcastId(seasonsQuery, qb, [podcastId])
  resultsArray.push({
    hasSeasons: true,
    isSerial
  })

  return resultsArray
}

const getEpisodesByPodcastIds = async (query) => {
  const {
    hasVideo,
    includePodcast,
    isMusic,
    liveItemStatus,
    maxResults,
    podcastId,
    podcastsOnly,
    searchTitle,
    sincePubDate,
    skip,
    sort,
    take
  } = query
  const podcastIds = (podcastId && podcastId.split(',')) || []

  const shouldUseEpisodesMostRecent = podcastIds.length > 1 && sort === 'most-recent'
  const qb = generateEpisodeSelects(
    includePodcast,
    searchTitle,
    sincePubDate,
    hasVideo,
    shouldUseEpisodesMostRecent,
    liveItemStatus,
    isMusic,
    podcastsOnly
  )

  if (podcastIds.length === 1) {
    const id = podcastIds[0]
    const podcast = await getPodcast(id)
    if (podcast?.hasSeasons && podcast?.itunesFeedType === 'serial') {
      return getEpisodesByPodcastIdWithSeasons({
        searchTitle,
        sincePubDate,
        hasVideo,
        itunesFeedType: podcast.itunesFeedType,
        podcastId,
        isMusic,
        podcastsOnly
      })
    } else {
      return getEpisodesByPodcastId(query, qb, podcastIds)
    }
  }

  qb.andWhere('episode.podcastId IN(:...podcastIds)', { podcastIds })
  qb.andWhere('episode."isPublic" IS true')

  const allowRandom = true
  const shouldLimitCount = shouldUseEpisodesMostRecent
  return handleGetEpisodesWithOrdering({ qb, query, skip, sort, take, maxResults }, allowRandom, shouldLimitCount)
}

const handleGetEpisodesWithOrdering = async (
  obj,
  allowRandom,
  shouldLimitCount,
  episodeIds?,
  isFromManticoreSearch?,
  totalOverride?
) => {
  const { query, skip, sort, take, maxResults } = obj
  const finalTake = maxResults ? maxResultsEpisodes : take

  let { qb } = obj
  qb.offset(skip)
  qb.limit(finalTake)

  qb = addOrderByToQuery(qb, 'episode', sort, 'pubDate', allowRandom, isFromManticoreSearch)

  if (query?.liveItemStatus === 'live') {
    const halfDayEarlier = new Date(new Date().getTime() - 12 * 60 * 60 * 1000)
    const halfDayLater = new Date(new Date().getTime() + 12 * 60 * 60 * 1000)
    qb.andWhere('"liveItem"."start" BETWEEN :halfDayEarlier AND :halfDayLater', { halfDayEarlier, halfDayLater })
  } else if (query?.liveItemStatus === 'pending') {
    const currentTime = new Date()
    qb.andWhere('"liveItem"."start" > :currentTime', { currentTime })
  }

  let episodes = [] as any
  let episodesCount = 0
  if (shouldLimitCount) {
    const results = await qb.offset(skip).limit(finalTake).getMany()
    episodes = results
    episodesCount = 10000
  } else {
    const results = await qb.offset(skip).limit(finalTake).getManyAndCount()
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

const getDeadEpisodes = async (customLimit?: number, customOffset?: number) => {
  const repository = getRepository(Episode)

  const subQueryEpisodesIsPublicFalse = repository
    .createQueryBuilder('episode')
    .select('episode.id', 'id')
    .where('episode."isPublic" = FALSE')
    .limit(customLimit || 100000)
    .offset(customOffset || 0)

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

const removeDeadEpisodes = async (customLimit?: number, customOffset?: number) => {
  const deadEpisodes = await getDeadEpisodes(customLimit, customOffset)
  await removeEpisodes(deadEpisodes)
}

const removeEpisodes = async (episodes: any[]) => {
  const repository = getRepository(Episode)
  const episodesCount = episodes.length
  const episodesSplit = Math.floor(episodesCount / 4)
  const episodes1 = episodes.slice(0, episodesSplit)
  const episodes2 = episodes.slice(episodesSplit, episodesSplit * 2)
  const episodes3 = episodes.slice(episodesSplit * 2, episodesSplit * 3)
  const episodes4 = episodes.slice(episodesSplit * 3)

  const removeEps = (eps: any[], jobNumber: number) => {
    console.log(`removeEps starting for jobNumber ${jobNumber}`)
    return new Promise(async () => {
      for (const episode of eps) {
        try {
          await new Promise((r) => setTimeout(r, 20))
          await repository.remove(episode)
        } catch (error) {
          console.log('***removeEps error***')
          console.log(`jobNumber: ${jobNumber}`)
          console.log(`episode.id: ${episode.id}`)
          console.log(`error: ${error.message}`)
        }
      }
    })
  }

  await Promise.all([
    removeEps(episodes1, 1),
    removeEps(episodes2, 2),
    removeEps(episodes3, 3),
    removeEps(episodes4, 4)
  ])
}

const checkIfValidVTSRemoteItem = (valueTimeSplit: any) => {
  return (
    valueTimeSplit &&
    valueTimeSplit.type === 'remoteItem' &&
    valueTimeSplit.startTime !== null &&
    valueTimeSplit.startTime >= 0 &&
    valueTimeSplit.duration !== null &&
    valueTimeSplit.duration >= 0
  )
}

const getLightningKeysendVTSAsChapters = async (episodeId: string) => {
  try {
    const episodeRepository = getRepository(Episode)
    const episode = (await episodeRepository
      .createQueryBuilder('episode')
      .select('episode.id', 'id')
      .select('episode.value', 'value')
      .where('episode.id = :id', { id: episodeId })
      .getRawOne()) as Episode

    let valueTags = episode?.value || []

    if (typeof valueTags === 'string') {
      valueTags = JSON.parse(valueTags)
    }

    const lightningKeysendValueTags = getLightningKeysendValueItem(valueTags)
    const valueTimeSplits = lightningKeysendValueTags?.valueTimeSplits as any[]

    const vtsChapters: any[] = []
    if (valueTimeSplits && valueTimeSplits.length > 0) {
      for (let i = 0; i <= valueTimeSplits.length; i++) {
        try {
          const valueTimeSplit = valueTimeSplits[i]
          if (checkIfValidVTSRemoteItem(valueTimeSplit)) {
            const startTime = Math.floor(valueTimeSplit.startTime)
            const duration = Math.floor(valueTimeSplit.duration)
            const endTime = startTime + duration
            let title = ''
            let imageUrl = ''
            let linkUrl = ''
            let remoteEpisodeId = ''
            let remotePodcastId = ''

            let episode: Episode | null = null
            let podcast: Podcast | null = null

            // TODO: is remoteItem missing from the partytime type?
            const remoteItemGuid = valueTimeSplit.remoteItem?.itemGuid
            const remoteFeedGuid = valueTimeSplit.remoteItem?.feedGuid

            const includeRelations = true
            podcast = await getPodcastByPodcastGuid(remoteFeedGuid, includeRelations)
            remotePodcastId = podcast.id
            const remoteMedium = podcast.medium

            if (podcast?.id && remoteItemGuid && remoteFeedGuid) {
              try {
                episode = await getEpisodeByPodcastIdAndGuid(podcast.id, remoteItemGuid)
                remoteEpisodeId = episode?.id || ''
              } catch (error) {
                // probably a 404
                // console.log('ep error', error)
              }
            }
            const podcastAuthors = podcast?.authors
            const episodeAuthors = episode?.authors

            let authorsTitle = ''
            if (episodeAuthors && episodeAuthors.length > 0) {
              for (const episodeAuthor of episodeAuthors) {
                authorsTitle += `${episodeAuthor.name || ''},`
              }
            } else if (podcastAuthors && podcastAuthors.length > 0) {
              for (const podcastAuthor of podcastAuthors) {
                authorsTitle += `${podcastAuthor.name || ''},`
              }
            }
            authorsTitle = authorsTitle.slice(0, -1)

            if (authorsTitle && episode?.title) {
              title = `${authorsTitle} – ${episode.title}`
            } else if (episode?.title) {
              title = `${episode.title}`
            }

            imageUrl = episode?.imageUrl || podcast?.imageUrl || podcast?.shrunkImageUrl || ''

            linkUrl = episode?.linkUrl || podcast?.linkUrl || ''

            const vtsChapter = {
              id: `vts-${i}`,
              endTime,
              imageUrl,
              isChapterToc: false,
              isChapterVts: true,
              linkUrl,
              startTime,
              title,
              remoteEpisodeId,
              remotePodcastId,
              remoteMedium
            }

            vtsChapters.push(vtsChapter)
          }
        } catch (error) {
          // probably a 404
          // console.log('podcast error', error)
        }
      }
    }

    return vtsChapters
  } catch (error) {
    console.log('getVTSAsChapters error', error)
  }

  return []
}

// TOC = Table of Contents chapters
const retrieveLatestChapters = async (id, includeNonToc = true) => {
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
    const oneHour = new Date().getTime() - 1 * 1 * 60 * 60 * 1000 // days hours minutes seconds milliseconds
    const chaptersUrlLastParsedDate = new Date(chaptersUrlLastParsed).getTime()

    if (chaptersUrl && (!chaptersUrlLastParsed || oneHour > chaptersUrlLastParsedDate)) {
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
            .addSelect('mediaRef.chapterHash', 'chapterHash')
            .where({
              isOfficialChapter: true,
              episode: episode.id
            })
          const existingChapters = await qb.getRawMany()

          // Temporarily hide all existing chapters,
          // then display the new valid ones at the end.
          // TODO: can we remove / improve this?
          for (const existingChapter of existingChapters) {
            await updateMediaRef(
              {
                ...existingChapter,
                isPublic: false
              },
              superUserId
            )
          }

          for (let i = 0; i < newChapters.length; i++) {
            try {
              const newChapter = newChapters[i]
              const roundedStartTime = Math.floor(newChapter.startTime)
              const roundedEndTime =
                newChapter.endTime !== null && newChapter.endTime >= 1 ? Math.floor(newChapter.endTime) : null
              const isChapterToc = newChapter.toc === false ? false : newChapter.toc

              const chapterInfoToHash = {
                startTime: roundedStartTime,
                endTime: roundedEndTime || null,
                isChapterToc,
                episodeId: id
              }

              const chapterHash = uuidv5(JSON.stringify(chapterInfoToHash), uuidNIL)

              const imageUrl = newChapter?.img?.replace(/ /g, '%20') || null
              const linkUrl = newChapter?.url?.replace(/ /g, '%20') || null

              // If a chapter with that chapterHash already exists, then update it.
              // If it does not exist, then create a new mediaRef with isOfficialChapter = true.
              const existingChapter = existingChapters.find((x) => x.chapterHash === chapterHash)
              if (existingChapter && existingChapter.id) {
                await updateMediaRef(
                  {
                    endTime: roundedEndTime,
                    id: existingChapter.id,
                    imageUrl,
                    isOfficialChapter: true,
                    isPublic: true,
                    linkUrl,
                    startTime: roundedStartTime,
                    title: newChapter.title,
                    episodeId: id,
                    isChapterToc,
                    chapterHash
                  },
                  superUserId
                )
              } else {
                await createMediaRef({
                  endTime: roundedEndTime,
                  imageUrl,
                  isOfficialChapter: true,
                  isPublic: true,
                  linkUrl,
                  startTime: roundedStartTime,
                  title: newChapter.title,
                  owner: superUserId,
                  episodeId: id,
                  isChapterToc,
                  chapterHash
                })
              }
            } catch (error) {
              console.log('retrieveLatestChapters newChapter', error)
            }
          }
        }

        const qb = mediaRefRepository
          .createQueryBuilder('mediaRef')
          .select('mediaRef.id', 'id')
          .addSelect('mediaRef.isOfficialChapter', 'isOfficialChapter')
          .addSelect('mediaRef.chapterHash', 'chapterHash')
          .addSelect('mediaRef.isPublic', 'isPublic')
          .where({
            isOfficialChapter: true,
            episode: episode.id,
            isPublic: false
          })

        const hiddenChaptersToDelete = await qb.getRawMany()
        for (const chapterToDelete of hiddenChaptersToDelete) {
          try {
            await mediaRefRepository.remove(chapterToDelete)
          } catch (error) {
            console.log('error removing isPublic false chapter:', error)
          }
        }
      } catch (error) {
        console.log('retrieveLatestChapters request', error)
      }
    }
  })()

  const qbOfficialChaptersForEpisode = mediaRefRepository
    .createQueryBuilder('mediaRef')
    .select('mediaRef.id')
    .addSelect('mediaRef.endTime')
    .addSelect('mediaRef.imageUrl')
    .addSelect('mediaRef.isOfficialChapter')
    .addSelect('mediaRef.linkUrl')
    .addSelect('mediaRef.startTime')
    .addSelect('mediaRef.title')
    .addSelect('mediaRef.isChapterToc')
    .addSelect('mediaRef.chapterHash')
    .where({
      isOfficialChapter: true,
      episode: id,
      isPublic: true
    })

  if (!includeNonToc) {
    qbOfficialChaptersForEpisode.andWhere('mediaRef.isChapterToc IS NOT FALSE')
  }

  const officialChaptersForEpisode = await qbOfficialChaptersForEpisode
    .orderBy('mediaRef.startTime', 'ASC')
    .getManyAndCount()

  return officialChaptersForEpisode
}

const refreshEpisodesMostRecentMaterializedView = async () => {
  const em = await getConnection().createEntityManager()
  await em.query('REFRESH MATERIALIZED VIEW CONCURRENTLY "episodes_most_recent"')
}

const dropAndRecreateEpisodesMostRecentMaterializedView = async () => {
  const em = await getConnection().createEntityManager()

  try {
    console.log('dropping materialized view')
    await em.query(`DROP MATERIALIZED VIEW "episodes_most_recent"`)
  } catch (error) {
    // If the materialized view was already dropped, it will throw an error,
    // but we still want to continue to create the view.
    console.log('dropAndRecreateEpisodesMostRecentMaterializedView error')
    console.log(error)
  }

  console.log('creating materialized view')
  await em.query(`
    CREATE MATERIALIZED VIEW "episodes_most_recent" AS
    SELECT e.*
    FROM
        "episodes" e
    WHERE e."isPublic" = true
      AND e."pubDate" > (NOW() - interval '14 days')
        AND e."pubDate" < (NOW() + interval '1 days')
  `)

  console.log('creating index on unique id')
  await em.query(`
    CREATE UNIQUE INDEX CONCURRENTLY "IDX_episodes_most_recent_id"
    ON "episodes_most_recent" (id)
  `)

  console.log('creating compound index on podcastId, isPublic, and pubDate')
  await em.query(`
    CREATE INDEX CONCURRENTLY "IDX_episodes_most_recent_podcastId_isPublic_pubDate"
    ON public."episodes_most_recent"
    USING btree ("podcastId", "isPublic", "pubDate")
  `)
}

/* This is intended to only be used in our parser. */
const getEpisodesWithLiveItemsWithMatchingGuids = async (podcastId: string, episodeGuids: string[]) => {
  let qb = getRepository(Episode).createQueryBuilder('episode')
  qb = addSelectsToQueryBuilder(qb)

  const episodes = await qb
    .innerJoin('episode.liveItem', 'liveItem', `liveItem.id IS NOT NULL`)
    .addSelect('liveItem.id')
    .addSelect('liveItem.end')
    .addSelect('liveItem.start')
    .addSelect('liveItem.status')
    .addSelect('liveItem.chatIRCURL')
    .where(`episode.podcastId = :podcastId`, { podcastId })
    // not checking for isPublic = true in case we want to restore a hidden row to be public
    .andWhere(`episode.guid IN (:...episodeGuids)`, { episodeGuids })
    .getMany()

  return episodes
}

/* This is intended to only be used in our parser. */
const getEpisodesWithLiveItemsWithoutMatchingGuids = async (podcastId: string, episodeGuids: string[]) => {
  let qb = getRepository(Episode).createQueryBuilder('episode')
  qb = addSelectsToQueryBuilder(qb)

  qb = qb
    .innerJoin('episode.liveItem', 'liveItem', `liveItem.id IS NOT NULL`)
    .addSelect('liveItem.id')
    .addSelect('liveItem.end')
    .addSelect('liveItem.start')
    .addSelect('liveItem.status')
    .addSelect('liveItem.chatIRCURL')
    .where(`episode.podcastId = :podcastId`, { podcastId })
    .andWhere(`episode.isPublic = true`)

  if (episodeGuids && episodeGuids.length > 0) {
    qb = qb.andWhere(`episode.guid NOT IN (:...episodeGuids)`, { episodeGuids })
  }

  const episodes = await qb.getMany()

  return episodes
}

type GetEpisodeWebUrl = {
  podcastGuid?: string
  podcastIndexId?: string
  episodeGuid?: string
}

const getEpisodeWebUrl = async ({ podcastGuid, podcastIndexId, episodeGuid }: GetEpisodeWebUrl) => {
  if (episodeGuid && podcastGuid) {
    const episode = await getRepository(Episode)
      .createQueryBuilder('episode')
      .innerJoin('episode.podcast', 'podcast')
      .addSelect('episode.id')
      .where(`podcast.podcastGuid = :podcastGuid`, { podcastGuid })
      .andWhere('episode.guid = :episodeGuid', { episodeGuid })
      .andWhere('episode.isPublic IS true')
      .getOne()

    if (!episode) {
      throw new createError.NotFound('Episode not found')
    }

    return {
      webUrl: `${config.websiteProtocol}://${config.websiteDomain}/episode/${episode.id}`
    }
  } else if (episodeGuid && podcastIndexId) {
    const episode = await getRepository(Episode)
      .createQueryBuilder('episode')
      .innerJoin('episode.podcast', 'podcast')
      .addSelect('episode.id')
      .where(`podcast.podcastIndexId = :podcastIndexId`, { podcastIndexId })
      .andWhere('episode.guid = :episodeGuid', { episodeGuid })
      .andWhere('episode.isPublic IS true')
      .getOne()

    if (!episode) {
      throw new createError.NotFound('Episode not found')
    }

    return {
      webUrl: `${config.websiteProtocol}://${config.websiteDomain}/episode/${episode.id}`
    }
  } else {
    throw new createError.NotFound('Episode not found')
  }
}

export {
  dropAndRecreateEpisodesMostRecentMaterializedView,
  getEpisode,
  getEpisodeByPodcastIdAndGuid,
  getEpisodeByPodcastIdAndMediaUrl,
  getEpisodes,
  getEpisodesByCategoryIds,
  getEpisodesByPodcastIds,
  getEpisodesFromSearchEngine,
  getEpisodesWithLiveItemsWithMatchingGuids,
  getEpisodesWithLiveItemsWithoutMatchingGuids,
  getLightningKeysendVTSAsChapters,
  refreshEpisodesMostRecentMaterializedView,
  removeDeadEpisodes,
  retrieveLatestChapters,
  getEpisodeWebUrl
}
