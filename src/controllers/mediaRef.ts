import { getRepository } from 'typeorm'
import { MediaRef } from 'entities'
import { validateClassOrThrow } from 'errors'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'episode', 'owner', 'podcast'
]

const createMediaRef = async (obj) => {
  const repository = getRepository(MediaRef)
  const mediaRef = new MediaRef()
  const newMediaRef = Object.assign(mediaRef, obj)

  await validateClassOrThrow(newMediaRef)

  await repository.save(newMediaRef)
  return newMediaRef
}

const deleteMediaRef = async (id) => {
  const repository = getRepository(MediaRef)
  const mediaRef = await repository.findOne({ id })

  if (!mediaRef) {
    throw new createError.NotFound('MediaRef not found')
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

const getMediaRefs = (query) => {
  const repository = getRepository(MediaRef)

  return repository.find({
    where: {
      ...query
    },
    relations
  })
}

const updateMediaRef = async (obj) => {
  const repository = getRepository(MediaRef)
  const mediaRef = await repository.findOne({ id: obj.id })

  if (!mediaRef) {
    throw new createError.NotFound('MediaRef not found')
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
