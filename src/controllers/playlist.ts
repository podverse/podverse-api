import { getRepository } from 'typeorm'
import { Playlist } from 'entities'

const relations = [
  'mediaRefs', 'owner'
]

const createPlaylist = async (obj) => {
  const repository = getRepository(Playlist)
  const playlist = new Playlist()
  const newPlaylist = Object.assign(playlist, obj)
  await repository.save(newPlaylist)
  return { ...newPlaylist }
}

const deletePlaylist = async (id) => {
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id })
  const result = await repository.remove(playlist)
  return result
}

const getPlaylist = async (id) => {
  const repository = getRepository(Playlist)
  return repository.findOne({ id }, { relations })
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

const updatePlaylist = async (id, obj) => {
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id })
  const newPlaylist = Object.assign(playlist, obj)
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
