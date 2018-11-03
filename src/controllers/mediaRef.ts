import { getRepository } from 'typeorm'
import { MediaRef } from 'entities'
import { validateClassOrThrow } from 'lib/errors'
import { convertToNowPlayingItem, NowPlayingItem } from 'lib/utility/nowPlayingItem'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'episode', 'episode.podcast'
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

const getMediaRefs = async (query, options, isNowPlayingItem) => {
  const repository = getRepository(MediaRef)

  const mediaRefs = await repository.find({
    where: {
      ...query
    },
    relations
  })

  // TODO: can we format the MediaRefs into NowPlayingItems using the TypeORM
  // query builder?
  if (isNowPlayingItem) {
    let nowPlayingItems: NowPlayingItem[] = []
    for (const mediaRef of mediaRefs) {
      nowPlayingItems.push(convertToNowPlayingItem(mediaRef))
    }
    return nowPlayingItems
  } else {
    return mediaRefs
  }
}

const updateMediaRef = async (obj, loggedInUserId) => {
  const repository = getRepository(MediaRef)
  const mediaRef = await repository.findOne({ id: obj.id })

  if (!mediaRef) {
    throw new createError.NotFound('MediaRef not found')
  }

  if (!mediaRef.owner) {
    throw new createError.Unauthorized('Cannot update an anonymous media ref')
  }

  if (mediaRef.owner && mediaRef.owner !== loggedInUserId) {
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
