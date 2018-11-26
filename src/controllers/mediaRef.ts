import { getRepository, In } from 'typeorm'
import { MediaRef } from 'entities'
import { validateClassOrThrow } from 'lib/errors'
import { createQueryOrderObject } from 'lib/utility'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'episode', 'episode.podcast', 'owner'
]

const createMediaRef = async (obj) => {
  const repository = getRepository(MediaRef)
  const mediaRef = new MediaRef()
  const newMediaRef = Object.assign(mediaRef, obj)

  await validateClassOrThrow(newMediaRef)

  await repository.save(newMediaRef)
  return newMediaRef
}

const deleteMediaRef = async (id, loggedInUserId) => {
  const repository = getRepository(MediaRef)
  const mediaRef = await repository.findOne({ id })

  if (!mediaRef) {
    throw new createError.NotFound('MediaRef not found')
  }

  if (!mediaRef.owner) {
    throw new createError.Unauthorized('Cannot delete an anonymous media ref')
  }

  if (mediaRef.owner && mediaRef.owner !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this media ref')
  }

  const result = await repository.remove(mediaRef)
  return result
}

const getMediaRef = (id) => {
  const repository = getRepository(MediaRef)
  const mediaRef = repository.findOne({ id }, { relations })

  if (!mediaRef) {
    throw new createError.NotFound('MediaRef not found')
  }

  return mediaRef
}

const getMediaRefs = async (query) => {
  const repository = getRepository(MediaRef)

  if (query.podcastId && query.podcastId.split(',').length > 1) {
    query.podcastId = In(query.podcastId.split(','))
  }

  const order = createQueryOrderObject(query.sort, 'createdAt')
  delete query.sort

  const skip = query.skip
  delete query.skip

  const take = query.take
  delete query.take

  const mediaRefs = await repository.find({
    where: {
      ...query,
      isPublic: true
    },
    order,
    skip: parseInt(skip, 10),
    take: parseInt(take, 10),
    relations
  })

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
