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
  await repository.delete(id)
  return { ...mediaRef }
}

const getMediaRef = (id) => {
  const repository = getRepository(MediaRef)
  return repository.findOne({ id }, { relations })
}

const getMediaRefs = () => {
  const repository = getRepository(MediaRef)
  return repository.find({ relations })
}

const updateMediaRef = async (id, obj) => {
  const repository = getRepository(MediaRef)
  const mediaRef = await repository.findOne({ id })
  const newMediaRef = Object.assign(mediaRef, obj)
  await repository.save(newMediaRef)
  return { ...newMediaRef }
}

export default {
  createMediaRef,
  deleteMediaRef,
  getMediaRef,
  getMediaRefs,
  updateMediaRef
}
