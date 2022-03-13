import { getRepository } from 'typeorm'
import { config } from '~/config'
import { MediaRef } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
import { addOrderByToQuery, getManticoreOrderByColumnName } from '~/lib/utility'
import { validateSearchQueryString } from '~/lib/utility/validation'
import { searchApi } from '~/services/manticore'
const createError = require('http-errors')
const { superUserId } = config

const relations = [
  'authors',
  'categories',
  'episode',
  'episode.podcast',
  'owner',
  'episode.podcast.authors',
  'episode.podcast.categories',
  'episode.podcast.feedUrls'
]

const createMediaRef = async (obj) => {
  const repository = getRepository(MediaRef)
  const mediaRef = new MediaRef()
  const newMediaRef = Object.assign(mediaRef, obj)

  if (!newMediaRef.episodeId) throw new Error('An episodeId is required to create a mediaRef')

  newMediaRef.episode = newMediaRef.episodeId
  delete newMediaRef.episodeId

  await validateClassOrThrow(newMediaRef)

  await repository.save(newMediaRef)
  return newMediaRef
}

const deleteMediaRef = async (id, loggedInUserId) => {
  const repository = getRepository(MediaRef)
  const mediaRef = await repository.findOne({
    where: { id },
    relations: ['owner']
  })

  if (!mediaRef) {
    throw new createError.NotFound('MediaRef not found')
  }

  if (!mediaRef.owner) {
    throw new createError.Unauthorized('Cannot delete an anonymous media ref')
  }

  if (mediaRef.owner && mediaRef.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this media ref')
  }

  const result = await repository.remove(mediaRef)
  return result
}

const getMediaRef = async (id) => {
  const repository = getRepository(MediaRef)
  const mediaRef = await repository.findOne({ id }, { relations })

  if (!mediaRef) {
    throw new createError.NotFound('MediaRef not found')
  }

  return mediaRef
}

const getPublicMediaRefsByEpisodeMediaUrl = (mediaUrl) => {
  return getRepository(MediaRef)
    .createQueryBuilder('mediaRef')
    .select('mediaRef.id')
    .addSelect('mediaRef.startTime')
    .addSelect('mediaRef.endTime')
    .addSelect('mediaRef.title')
    .innerJoin('mediaRef.episode', 'episode')
    .where('episode.mediaUrl = :mediaUrl', { mediaUrl })
    .andWhere('mediaRef.isPublic = TRUE')
    .orderBy('mediaRef.startTime', 'ASC')
    .getManyAndCount()
}

const getMediaRefsFromSearchEngine = async (query) => {
  const { searchTitle, skip, sort, take } = query

  const { orderByColumnName, orderByDirection } = getManticoreOrderByColumnName(sort)
  const manticoreSort = ['_score', { [orderByColumnName]: orderByDirection }]

  if (!searchTitle) throw new Error('Must provide a searchTitle.')

  const result = await searchApi.search({
    index: 'idx_media_ref',
    // eslint-disable-next-line @typescript-eslint/camelcase
    track_scores: true,
    query: {
      match: {
        title: `*${searchTitle}*`
      }
    },
    sort: manticoreSort,
    limit: take,
    offset: skip
  })

  let mediaRefIds = [] as any[]
  const { hits, total } = result.hits
  if (Array.isArray(hits)) {
    mediaRefIds = hits.map((x: any) => x._source.podverse_id)
  }
  const mediaRefIdsString = mediaRefIds.join(',')
  if (!mediaRefIdsString) return [hits, total]

  delete query.searchTitle
  delete query.skip
  query.mediaRefId = mediaRefIdsString

  const isFromManticoreSearch = true
  return getMediaRefs(query, isFromManticoreSearch)
}

const getMediaRefs = async (query, isFromManticoreSearch) => {
  const includeNSFW = true
  const repository = getRepository(MediaRef)
  const { mediaRefId, searchTitle } = query
  const mediaRefIds = (mediaRefId && mediaRefId.split(',')) || []
  const podcastIds = (query.podcastId && query.podcastId.split(',')) || []
  const episodeIds = (query.episodeId && query.episodeId.split(',')) || []
  const categoriesIds = (query.categories && query.categories.split(',')) || []
  const { /* hasVideo,*/ includeEpisode, includePodcast, skip, take } = query

  // ${hasVideo ? `AND episode.mediaType = 'video/%'` : ''}
  const queryConditions = `
    episode.isPublic = true
    ${includeNSFW ? '' : 'AND episode.isExplicit = :isExplicit'}
    ${podcastIds.length > 0 ? 'AND episode.podcastId IN (:...podcastIds)' : ''}
    ${episodeIds.length > 0 ? 'AND episode.id IN (:...episodeIds)' : ''}
  `
  const categoryJoinConditions = `${categoriesIds.length > 0 ? 'categories.id IN (:...categoriesIds)' : ''}`

  let qb = repository.createQueryBuilder('mediaRef')

  if (includePodcast) {
    qb.innerJoinAndSelect('mediaRef.episode', 'episode', queryConditions, {
      isExplicit: !!includeNSFW,
      podcastIds: podcastIds,
      episodeIds: episodeIds
    })
    qb.innerJoinAndSelect('episode.podcast', 'podcast')

    if (categoryJoinConditions) {
      qb.innerJoin('podcast.categories', 'categories', categoryJoinConditions, { categoriesIds })
    }
  } else if (includeEpisode) {
    qb.innerJoinAndSelect('mediaRef.episode', 'episode', queryConditions, {
      isExplicit: !!includeNSFW,
      podcastIds: podcastIds,
      episodeIds: episodeIds
    })
  } else {
    qb.innerJoin('mediaRef.episode', 'episode', queryConditions, {
      isExplicit: !!includeNSFW,
      podcastIds: podcastIds,
      episodeIds: episodeIds
    })
  }

  qb.innerJoin('mediaRef.owner', 'user')
  qb.addSelect('user.id')
  qb.addSelect('user.name')
  qb.addSelect('user.isPublic')

  qb.where({ isPublic: true })

  // Throws an error if searchTitle is defined but invalid
  if (searchTitle) validateSearchQueryString(searchTitle)
  qb.andWhere(`${searchTitle ? 'LOWER(mediaRef.title) LIKE :searchTitle' : 'true'}`, {
    searchTitle: `%${searchTitle?.toLowerCase().trim()}%`
  })

  qb.andWhere('"mediaRef"."isOfficialChapter" IS null')

  if (mediaRefIds?.length) {
    qb.andWhere('mediaRef.id IN (:...mediaRefIds)', { mediaRefIds })
  }

  const allowRandom = podcastIds.length > 0 || episodeIds.length > 0
  qb = addOrderByToQuery(qb, 'mediaRef', query.sort, 'createdAt', allowRandom, isFromManticoreSearch)

  const shouldLimitResultTotal =
    (mediaRefIds.length === 0 && podcastIds.length === 0 && episodeIds.length === 0 && categoriesIds.length === 0) ||
    podcastIds.length > 1 ||
    episodeIds.length > 1 ||
    categoriesIds.length >= 1

  let mediaRefs = [] as any
  let mediaRefsCount = 0
  if (shouldLimitResultTotal) {
    const results = await qb.offset(skip).limit(take).getMany()
    mediaRefs = results
    mediaRefsCount = 10000
  } else {
    const results = await qb.offset(skip).limit(take).getManyAndCount()
    mediaRefs = results[0] || []
    mediaRefsCount = results[1] || 0
  }

  const PIIScrubbedMediaRefs = mediaRefs.map((x: any) => {
    if (x.owner && !x.owner.isPublic) {
      delete x.owner.name
      delete x.owner.isPublic
    }
    return x
  })

  if (mediaRefIds?.length && isFromManticoreSearch) {
    mediaRefs.sort(function (m1, m2) {
      return mediaRefIds.indexOf(m1.id) - mediaRefIds.indexOf(m2.id)
    })
  }

  return [PIIScrubbedMediaRefs, mediaRefsCount]
}

const updateMediaRef = async (obj, loggedInUserId) => {
  const repository = getRepository(MediaRef)
  const mediaRef = await repository.findOne({
    where: {
      id: obj.id
    },
    relations
  })

  if (!mediaRef) {
    throw new createError.NotFound('MediaRef not found')
  }

  if (!mediaRef.owner) {
    throw new createError.Unauthorized('Cannot update an anonymous media ref')
  }

  if (mediaRef.owner && mediaRef.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to edit this media ref')
  }

  const newMediaRef = Object.assign(mediaRef, obj)
  newMediaRef.episode = newMediaRef.episodeId
  delete newMediaRef.episodeId

  await validateClassOrThrow(newMediaRef)

  await repository.save(newMediaRef)
  return newMediaRef
}

const updateSoundBites = async (episodeId, newSoundBites, episodeTitle, podcastTitle) => {
  const repository = getRepository(MediaRef)
  const existingSoundBitesResult = (await repository
    .createQueryBuilder('mediaRef')
    .select('mediaRef.id')
    .addSelect('mediaRef.endTime')
    .addSelect('mediaRef.imageUrl')
    .addSelect('mediaRef.isOfficialSoundBite')
    .addSelect('mediaRef.isPublic')
    .addSelect('mediaRef.linkUrl')
    .addSelect('mediaRef.startTime')
    .addSelect('mediaRef.title')
    .where({
      isOfficialSoundBite: true,
      isPublic: true,
      episode: episodeId
    })
    .orderBy('mediaRef.startTime', 'ASC')
    .getManyAndCount()) as any
  let existingSoundBites = existingSoundBitesResult[0]

  for (const newSoundBite of newSoundBites) {
    const { title } = newSoundBite
    let { duration, startTime } = newSoundBite
    duration = Math.floor(duration)
    startTime = Math.floor(startTime)

    if (duration <= 0) continue
    const endTime = startTime + duration

    // use duck-typing to find an existingSoundBite with the same startTime
    // and duration as the newSoundBite
    const existingSoundBite = existingSoundBites.find((x: any) => {
      return x.startTime === startTime && x.endTime === endTime
    })

    if (existingSoundBite) {
      existingSoundBite.startTime = startTime
      existingSoundBite.endTime = endTime
      existingSoundBite.title = title !== episodeTitle && title !== podcastTitle ? title : ''

      await updateMediaRef(existingSoundBite, superUserId)

      // remove existing soundbite from existingSoundBites
      existingSoundBites = existingSoundBites.filter((x: any) => {
        return !(x.startTime === startTime && x.endTime === endTime)
      })
    } else {
      await createMediaRef({
        episodeId,
        isOfficialSoundBite: true,
        isPublic: true,
        startTime,
        endTime,
        owner: superUserId
      })
    }
  }

  // hide leftoverExistingSoundBites by setting the isPublic = false flag on each
  const leftoverExistingSoundBites = existingSoundBites
  for (const leftoverExistingSoundBite of leftoverExistingSoundBites) {
    leftoverExistingSoundBite.isPublic = false
    await updateMediaRef(leftoverExistingSoundBite, superUserId)
  }
}

export {
  createMediaRef,
  deleteMediaRef,
  getMediaRef,
  getMediaRefs,
  getMediaRefsFromSearchEngine,
  getPublicMediaRefsByEpisodeMediaUrl,
  updateMediaRef,
  updateSoundBites
}
