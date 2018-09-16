import { getRepository } from 'typeorm'
import { MediaRef } from 'entities'

const relations = [
  'authors', 'categories', 'episode', 'owner', 'podcast'
]

const createMediaRef = async (obj) => {
  const repository = getRepository(MediaRef)
  const mediaRef = new MediaRef()
  const newMediaRef = Object.assign(mediaRef, obj)
  await repository.save(newMediaRef)
  return { ...newMediaRef }
}

const deleteMediaRef = async (id) => {
  const repository = getRepository(MediaRef)
  const mediaRef = await repository.findOne({ id })  
  const result = await repository.remove(mediaRef)
  return result
}

const getMediaRef = (id) => {
  const repository = getRepository(MediaRef)
  return repository.findOne({ id }, { relations })
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
  const newMediaRef = Object.assign(mediaRef, obj)
  await repository.save(newMediaRef)
  return { ...newMediaRef }
}

export {
  createMediaRef,
  deleteMediaRef,
  getMediaRef,
  getMediaRefs,
  updateMediaRef
}
