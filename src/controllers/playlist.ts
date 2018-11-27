import { getRepository } from 'typeorm'
import { Playlist, MediaRef } from 'entities'
import { validateClassOrThrow } from 'lib/errors'
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

const deletePlaylist = async (id, loggedInUserId) => {
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  if (playlist.owner !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this playlist')
  }

  const result = await repository.remove(playlist)
  return result
}

const getPlaylist = async (id) => {
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id }, { relations })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  return playlist
}

const getPlaylists = (query, options) => {
  const repository = getRepository(Playlist)

  return repository.find({
    where: {
      ...query
    },
    relations,
    ...options
  })
}

const updatePlaylist = async (obj, loggedInUserId) => {
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id: obj.id })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  if (playlist.owner !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this playlist')
  }

  const newPlaylist = Object.assign(playlist, obj)

  await validateClassOrThrow(newPlaylist)

  await repository.save(newPlaylist)
  return newPlaylist
}

const addOrRemovePlaylistItem = async (playlistId, mediaRefId, loggedInUserId) => {
  const repository = getRepository(Playlist)
  let playlist = await repository.findOne(
    {
      where: {
        id: playlistId
      },
      relations
    }
  )

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  if (!loggedInUserId || playlist.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this playlist')
  }

  // If no mediaRefs match filter, add the playlist item.
  // Else, remove the playlist item.
  const filteredMediaRefs = playlist.mediaRefs.filter(x => x.id !== mediaRefId)

  if (filteredMediaRefs.length === playlist.mediaRefs.length) {
    const mediaRefRepository = getRepository(MediaRef)
    let mediaRef = await mediaRefRepository.findOne({ id: mediaRefId })
    if (mediaRef) {
      playlist.mediaRefs.push(mediaRef)
    } else {
      throw new createError.NotFound('MediaRef not found')
    }
  } else {
    playlist.mediaRefs = filteredMediaRefs
  }

  await validateClassOrThrow(playlist)

  const saved = await repository.save(playlist)

  return saved
}

export {
  addOrRemovePlaylistItem,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  updatePlaylist
}
