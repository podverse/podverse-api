import { getRepository, In } from 'typeorm'
import { Episode, Playlist, MediaRef, User } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
const createError = require('http-errors')

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
  const playlist = await repository.findOne({
    where: {
      id
    },
    relations: ['owner']
  })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  if (playlist.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this playlist')
  }

  const result = await repository.remove(playlist)
  return result
}

const getPlaylist = async id => {
  const relations = [
    'episodes', 'episodes.podcast',
    'mediaRefs', 'mediaRefs.episode', 'mediaRefs.episode.podcast',
    'owner'
  ]
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id }, { relations })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  return playlist
}

const getPlaylists = (query) => {
  const repository = getRepository(Playlist)

  if (query.playlistId && query.playlistId.split(',').length > 1) {
    query.id = In(query.playlistId.split(','))
  } else if (query.playlistId) {
    query.id = query.playlistId
  } else {
    return
  }

  delete query.sort
  delete query.skip
  delete query.take

  return repository.find({
    where: {
      ...query
    },
    relations: ['owner']
  })
}

const updatePlaylist = async (obj, loggedInUserId) => {
  const relations = [
    'episodes', 'episodes.podcast',
    'mediaRefs', 'mediaRefs.episode', 'mediaRefs.episode.podcast',
    'owner'
  ]
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({
    where: {
      id: obj.id
    },
    relations
  })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  if (playlist.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this playlist')
  }

  const newPlaylist = Object.assign(playlist, obj)

  await validateClassOrThrow(newPlaylist)

  await repository.save(newPlaylist)
  return newPlaylist
}

const addOrRemovePlaylistItem = async (playlistId, mediaRefId, episodeId, loggedInUserId) => {
  const relations = [
    'episodes', 'episodes.podcast',
    'mediaRefs', 'mediaRefs.episode', 'mediaRefs.episode.podcast',
    'owner'
  ]
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

  let itemsOrder = playlist.itemsOrder

  if (mediaRefId) {
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

    playlist.itemsOrder = itemsOrder.filter(x => x !== mediaRefId)
  } else if (episodeId) {
    // If no episodes match filter, add the playlist item.
    // Else, remove the playlist item.
    const filteredEpisodes = playlist.episodes.filter(x => x.id !== episodeId)

    if (filteredEpisodes.length === playlist.episodes.length) {
      const episodeRepository = getRepository(Episode)
      let episode = await episodeRepository.findOne({ id: episodeId })
      if (episode) {
        playlist.episodes.push(episode)
      } else {
        throw new createError.NotFound('Episode not found')
      }
    } else {
      playlist.episodes = filteredEpisodes
    }

    playlist.itemsOrder = itemsOrder.filter(x => x !== episodeId)
  } else {
    throw new createError.NotFound('Must provide a MediaRef or Episode id')
  }

  await validateClassOrThrow(playlist)

  const saved = await repository.save(playlist)

  return saved
}

const toggleSubscribeToPlaylist = async (playlistId, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this playlist')
  }

  const playlist = await getPlaylist(playlistId)

  if (playlist.owner.id === loggedInUserId) {
    throw new createError.BadRequest('Cannot subscribe to your own playlist')
  }

  const repository = getRepository(User)
  let user = await repository.findOne(
    {
      where: {
        id: loggedInUserId
      },
      select: [
        'id',
        'subscribedPlaylistIds'
      ]
    }
  )

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  let subscribedPlaylistIds = user.subscribedPlaylistIds

  // If no playlistIds match the filter, add the playlistId.
  // Else, remove the playlistId.
  const filteredPlaylists = user.subscribedPlaylistIds.filter(x => x !== playlistId)
  if (filteredPlaylists.length === user.subscribedPlaylistIds.length) {
    subscribedPlaylistIds.push(playlistId)
  } else {
    subscribedPlaylistIds = filteredPlaylists
  }

  await repository.update(loggedInUserId, { subscribedPlaylistIds })

  return subscribedPlaylistIds
}

export {
  addOrRemovePlaylistItem,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  toggleSubscribeToPlaylist,
  updatePlaylist
}
