import { getRepository } from 'typeorm'
import { MediaRef } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
import { getQueryOrderColumn } from '~/lib/utility'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'episode', 'episode.podcast', 'owner'
]

const createMediaRef = async obj => {
  const repository = getRepository(MediaRef)
  const mediaRef = new MediaRef()
  const newMediaRef = Object.assign(mediaRef, obj)
  newMediaRef.episode = newMediaRef.episodeId
  // owner id optionally added in route
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

const getMediaRef = id => {
  const repository = getRepository(MediaRef)
  const mediaRef = repository.findOne({ id }, { relations })

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

  const episodeJoinAndSelect = `
    ${includeNSFW ? 'true' : 'episode.isExplicit = :isExplicit'}
    ${podcastIds.length > 0 ? 'AND episode.podcastId IN (:...podcastIds)' : ''}
    ${episodeIds.length > 0 ? 'AND episode.id IN (:...episodeIds)' : ''}
  `

  const mediaRefs = await repository
    .createQueryBuilder('mediaRef')
    .innerJoinAndSelect(
      'mediaRef.episode',
      'episode',
      episodeJoinAndSelect,
      {
        isExplicit: !!includeNSFW,
        podcastId: query.podcastId,
        podcastIds: podcastIds,
        episodeId: query.episodeId,
        episodeIds: episodeIds
      }
    )
    .innerJoinAndSelect('episode.podcast', 'podcast')
    .where({ isPublic: true })
    .skip(query.skip)
    .take(query.take)
    .orderBy(orderColumn, 'ASC')
    .getMany()

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
  newMediaRef.owner = loggedInUserId
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
