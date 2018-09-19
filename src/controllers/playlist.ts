import { getRepository } from 'typeorm'
import { Playlist } from 'entities'
import { validateClassOrThrow } from 'errors'
const createError = require('http-errors')

const relations = [
  'mediaRefs', 'owner'
]

const createPlaylist = async (obj) => {
  const repository = getRepository(Playlist)
  const playlist = new Playlist()
  const newPlaylist = Object.assign(playlist, obj)

  await validateClassOrThrow(newPlaylist)

  await repository.save(newPlaylist)
  return newPlaylist
}

const deletePlaylist = async (id) => {
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  const result = await repository.remove(playlist)
  return result
}

const getPlaylist = async (id) => {
  const repository = getRepository(Playlist)
  const playlist = repository.findOne({ id }, { relations })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  return playlist
}

const getPlaylists = (query) => {
  const repository = getRepository(Playlist)

  return repository.find({
    where: {
      ...query
    },
    relations
  })
}

const updatePlaylist = async (obj) => {
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id: obj.id })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  const newPlaylist = Object.assign(playlist, obj)

  await validateClassOrThrow(newPlaylist)

  await repository.save(newPlaylist)
  return { ...newPlaylist }
}

export {
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  updatePlaylist
}
