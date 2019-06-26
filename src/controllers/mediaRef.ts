import { getRepository } from 'typeorm'
import { MediaRef } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
import { getQueryOrderColumn } from '~/lib/utility'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'episode', 'episode.podcast', 'owner',
  'episode.podcast.authors', 'episode.podcast.categories'
]

const createMediaRef = async obj => {
  const repository = getRepository(MediaRef)
  const mediaRef = new MediaRef()
  const newMediaRef = Object.assign(mediaRef, obj)
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

const getMediaRefs = async (query, includeNSFW) => {
  const repository = getRepository(MediaRef)
  const orderColumn = getQueryOrderColumn('mediaRef', query.sort, 'createdAt')
  let podcastIds = query.podcastId && query.podcastId.split(',') || []
  let episodeIds = query.episodeId && query.episodeId.split(',') || []
  const { includeEpisode, includePodcast, searchAllFieldsText, skip, take } = query

  const queryConditions = `
    ${includeNSFW ? 'true' : 'episode.isExplicit = :isExplicit'}
    ${podcastIds.length > 0 ? 'AND episode.podcastId IN (:...podcastIds)' : ''}
    ${episodeIds.length > 0 ? 'AND episode.id IN (:...episodeIds)' : ''}
  `

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

  if (searchAllFieldsText) {
    qb.where(
      `LOWER(mediaRef.title) LIKE :searchAllFieldsText OR
      LOWER(episode.title) LIKE :searchAllFieldsText OR
      LOWER(podcast.title) LIKE :searchAllFieldsText`,
      { searchAllFieldsText: `%${searchAllFieldsText.toLowerCase()}%` }
    )
    qb.andWhere(`
      mediaRef.title IS NOT NULL AND
      mediaRef.title <> ''
    `)
    qb.andWhere('"mediaRef"."isPublic" = true')
  } else {
    qb.where({ isPublic: true })
  }

  const mediaRefs = await qb
    .skip(skip)
    .take(take)
    // @ts-ignore
    .orderBy(orderColumn[0], orderColumn[1])
    .getManyAndCount()

  return mediaRefs
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

export {
  createMediaRef,
  deleteMediaRef,
  getMediaRef,
  getMediaRefs,
  updateMediaRef
}
