import { getRepository } from 'typeorm'
import { config } from '~/config'
import { MediaRef } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
import { addOrderByToQuery } from '~/lib/utility'
import { validateSearchQueryString } from '~/lib/utility/validation'
const createError = require('http-errors')
const { superUserId } = config

const relations = [
  'authors', 'categories', 'episode', 'episode.podcast', 'owner',
  'episode.podcast.authors', 'episode.podcast.categories', 'episode.podcast.feedUrls'
]

const createMediaRef = async obj => {
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

const getMediaRef = async id => {
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
    .innerJoin(
      'mediaRef.episode',
      'episode'
    )
    .where('episode.mediaUrl = :mediaUrl', { mediaUrl })
    .andWhere('mediaRef.isPublic = TRUE')
    .orderBy('mediaRef.startTime', 'ASC')
    .getManyAndCount()
}

const getMediaRefs = async (query, includeNSFW) => {
  const repository = getRepository(MediaRef)

  const podcastIds = query.podcastId && query.podcastId.split(',') || []
  const episodeIds = query.episodeId && query.episodeId.split(',') || []
  const categoriesIds = query.categories && query.categories.split(',') || []
  const { allowUntitled, includeEpisode, includePodcast, searchAllFieldsText, skip, take } = query

  const queryConditions = `
    episode.isPublic = true
    ${includeNSFW ? '' : 'AND episode.isExplicit = :isExplicit'}
    ${podcastIds.length > 0 ? 'AND episode.podcastId IN (:...podcastIds)' : ''}
    ${episodeIds.length > 0 ? 'AND episode.id IN (:...episodeIds)' : ''}
  `

  const categoryJoinConditions = `${categoriesIds.length > 0 ? 'categories.id IN (:...categoriesIds)' : ''}`

  let qb = repository.createQueryBuilder('mediaRef')

  if (includePodcast) {
    qb.innerJoinAndSelect(
      'mediaRef.episode',
      'episode',
      queryConditions,
      {
        isExplicit: !!includeNSFW,
        podcastIds: podcastIds,
        episodeIds: episodeIds
      })
    qb.innerJoinAndSelect('episode.podcast', 'podcast')

    if (categoryJoinConditions) {
      qb.innerJoin(
        'podcast.categories',
        'categories',
        categoryJoinConditions,
        { categoriesIds }
      )
    }
  } else if (includeEpisode) {
    qb.innerJoinAndSelect(
        'mediaRef.episode',
        'episode',
        queryConditions,
      {
        isExplicit: !!includeNSFW,
        podcastIds: podcastIds,
        episodeIds: episodeIds
      })
  } else {
    qb.innerJoin(
      'mediaRef.episode',
      'episode',
      queryConditions,
      {
        isExplicit: !!includeNSFW,
        podcastIds: podcastIds,
        episodeIds: episodeIds
      })
  }

  qb.innerJoin('mediaRef.owner', 'user')
  qb.addSelect('user.id')
  qb.addSelect('user.name')
  qb.addSelect('user.isPublic')

  if (searchAllFieldsText) {
    validateSearchQueryString(searchAllFieldsText)
    qb.where(
      `LOWER(mediaRef.title) LIKE :searchAllFieldsText OR
      LOWER(episode.title) LIKE :searchAllFieldsText OR
      LOWER(podcast.title) LIKE :searchAllFieldsText`,
      { searchAllFieldsText: `%${searchAllFieldsText.toLowerCase().trim()}%` }
    )
    qb.andWhere('"mediaRef"."isPublic" = true')
  } else {
    qb.where({ isPublic: true })
  }
  qb.andWhere('"mediaRef"."isOfficialChapter" IS null')

  if (!allowUntitled) {
    qb.andWhere(`
      mediaRef.title IS NOT NULL AND
      mediaRef.title <> ''
    `)
  }
  
  qb = addOrderByToQuery(qb, 'mediaRef', query.sort, 'createdAt')

  const mediaRefs = await qb
    .offset(skip)
    .limit(take)
    .getManyAndCount()

  const PIIScrubbedMediaRefs = mediaRefs[0].map((x: any) => {
    if (x.owner && !x.owner.isPublic) {
      delete x.owner.name
      delete x.owner.isPublic
    }
    return x
  })

  return [PIIScrubbedMediaRefs, mediaRefs[1]]
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

const updateSoundBites = async (episodeId, newSoundBites) => {
  const repository = getRepository(MediaRef)
  const existingSoundBitesResult = await repository
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
    .getManyAndCount() as any
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
      return (x.startTime === startTime) && (x.endTime === endTime)
    })

    if (existingSoundBite) {
      existingSoundBite.startTime = startTime
      existingSoundBite.endTime = endTime
      existingSoundBite.title = title
      await updateMediaRef(existingSoundBite, superUserId)

      // remove existing soundbite from existingSoundBites
      existingSoundBites = existingSoundBites.filter((x: any) => {
        return !((x.startTime === startTime) && (x.endTime === endTime))
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
  getPublicMediaRefsByEpisodeMediaUrl,
  updateMediaRef,
  updateSoundBites
}
