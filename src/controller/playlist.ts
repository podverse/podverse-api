import { getRepository } from 'typeorm'
import { Playlist } from 'entities'

const relations = [
  'owner'
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
  await repository.delete(id)
  return { ...playlist }
}

const getPlaylist = async (id) => {
  const repository = getRepository(Playlist)
  return repository.findOne({ id }, { relations })
}

const getPlaylists = async () => {
  const repository = getRepository(Playlist)
  return repository.find({ relations })
}

const updatePlaylist = async (id, obj) => {
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id })
  const newPlaylist = Object.assign(playlist, obj)
  await repository.save(newPlaylist)
  return { ...newPlaylist }
}

export default {
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  updatePlaylist
}
