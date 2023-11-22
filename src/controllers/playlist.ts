import { getRepository } from 'typeorm'
import { Playlist, User } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
import { getUserSubscribedPlaylistIds } from './user'
import { getMediaRef } from './mediaRef'
import { getEpisode } from './episode'
import { combineAndSortPlaylistItems } from 'podverse-shared'
const createError = require('http-errors')

// medium = podcast are always be put in the general "mixed" category for playlists
const getPlaylistMedium = (medium) => {
  if (!medium || medium === 'podcast') {
    medium = 'mixed'
  }

  return medium
}

const playlistDefaultTitles = {
  // 'podcast': 'Favorites',
  music: 'Favorite Music',
  video: 'Favorite Videos',
  film: 'Favorite Films',
  audiobook: 'Favorite Audiobooks',
  newsletter: 'Favorite Newsletters',
  blog: 'Favorite Blogs',
  'music-video': 'Favorite Music Videos',
  mixed: 'Favorites'
}

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

const getPlaylist = async (id) => {
  const relations = [
    'episodes',
    'episodes.podcast',
    'episodes.podcast.authors',
    'mediaRefs',
    'mediaRefs.episode',
    'mediaRefs.episode.podcast',
    'mediaRefs.episode.podcast.authors',
    'owner'
  ]
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({ id }, { relations })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  if (!playlist.owner.isPublic) {
    delete playlist.owner.name
  }

  return playlist
}

const getSubscribedPlaylists = async (query, loggedInUserId) => {
  const subscribedPlaylistIds = await getUserSubscribedPlaylistIds(loggedInUserId)
  query.playlistId = subscribedPlaylistIds.join(',')
  return getPlaylists(query)
}

const getPlaylists = async (query) => {
  const repository = getRepository(Playlist)

  if (query.playlistId && query.playlistId.split(',').length > 1) {
    query.id = query.playlistId.split(',')
  } else if (query.playlistId) {
    query.id = [query.playlistId]
  } else {
    return []
  }

  const playlists = await repository
    .createQueryBuilder('playlist')
    .select('playlist.id')
    .addSelect('playlist.description')
    .addSelect('playlist.isDefault')
    .addSelect('playlist.isPublic')
    .addSelect('playlist.itemCount')
    .addSelect('playlist.itemsOrder')
    .addSelect('playlist.medium')
    .addSelect('playlist.title')
    .addSelect('playlist.createdAt')
    .addSelect('playlist.updatedAt')
    .innerJoin('playlist.owner', 'user')
    .addSelect('user.id')
    .addSelect('user.name')
    .where('playlist.id IN (:...playlistIds)', { playlistIds: query.id })
    .orderBy('playlist.title', 'ASC')
    .getMany()

  return playlists
}

const updatePlaylist = async (obj, loggedInUserId) => {
  // Make sure medium and isDefault is preserved after update
  const relations = [
    'episodes',
    'episodes.podcast',
    'mediaRefs',
    'mediaRefs.episode',
    'mediaRefs.episode.podcast',
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

const getOrCreateDefaultPlaylist = async (medium, loggedInUserId) => {
  const filteredMedium = getPlaylistMedium(medium)
  let playlist = await getDefaultPlaylist(filteredMedium, loggedInUserId)

  if (!playlist) {
    const newDefaultPlaylistData = {
      owner: loggedInUserId,
      isDefault: true,
      description: '',
      isPublic: false,
      itemsOrder: [],
      medium: filteredMedium,
      title: playlistDefaultTitles[filteredMedium]
    }
    playlist = await createPlaylist(newDefaultPlaylistData)
  }

  if (!playlist) {
    throw new createError.NotFound('Default playlist not created')
  }

  return playlist
}

const getDefaultPlaylist = async (filteredMedium, loggedInUserId) => {
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({
    where: {
      owner: loggedInUserId,
      isDefault: true,
      medium: filteredMedium
    }
  })

  return playlist
}

const addOrRemovePlaylistItemToDefaultPlaylist = async (mediaRefId, episodeId, loggedInUserId) => {
  if (mediaRefId) {
    const mediaRef = await getMediaRef(mediaRefId)

    if (!mediaRef) {
      throw new createError.NotFound('MediaRef not found')
    }

    const filteredMedium = getPlaylistMedium(mediaRef.episode.podcast.medium)
    const defaultPlaylist = await getOrCreateDefaultPlaylist(filteredMedium, loggedInUserId)

    const playlistId = defaultPlaylist.id
    const episodeId = null
    return await addOrRemovePlaylistItem(playlistId, mediaRefId, episodeId, loggedInUserId)
  } else if (episodeId) {
    const episode = await getEpisode(episodeId)

    if (!episode) {
      throw new createError.NotFound('Episode not found')
    }

    const filteredMedium = getPlaylistMedium(episode.podcast.medium)
    const defaultPlaylist = await getOrCreateDefaultPlaylist(filteredMedium, loggedInUserId)

    const playlistId = defaultPlaylist.id
    const mediaRefId = null
    return await addOrRemovePlaylistItem(playlistId, mediaRefId, episodeId, loggedInUserId)
  }

  throw new createError.NotFound('Could not update default playlist')
}

const addOrRemovePlaylistItem = async (playlistId, mediaRefId, episodeId, loggedInUserId) => {
  const relations = [
    'episodes',
    'episodes.podcast',
    'mediaRefs',
    'mediaRefs.episode',
    'mediaRefs.episode.podcast',
    'owner'
  ]
  const repository = getRepository(Playlist)
  const playlist = await repository.findOne({
    where: {
      id: playlistId
    },
    relations
  })

  if (!playlist) {
    throw new createError.NotFound('Playlist not found')
  }

  if (!loggedInUserId || playlist.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this playlist')
  }

  const { episodes, itemsOrder: previousItemsOrder, mediaRefs } = playlist

  /*
    Prior to 4.15.6, the itemsOrder property was not getting set properly.
    As a result the itemsOrder may have fallen out-of-sync with the saved
    episodes and mediaRefs. Whenever the itemsOrder.length does not match
    the combinedItems length, then fully update the itemsOrder.
  */

  let newItemsOrder = previousItemsOrder
  const combinedItemsTotal = episodes.length + mediaRefs.length
  if (combinedItemsTotal !== previousItemsOrder.length) {
    const combinedAndSortedItems = combineAndSortPlaylistItems(
      episodes as any,
      mediaRefs as any,
      previousItemsOrder as any
    )
    newItemsOrder = combinedAndSortedItems.map((item: any) => item.id)
  }

  let actionTaken = ''

  if (mediaRefId) {
    // If no mediaRefs match filter, add the playlist item. Else, remove the playlist item.
    const filteredMediaRefs = mediaRefs.filter((x) => x.id !== mediaRefId)
    const mediaRefWasRemoved = filteredMediaRefs.length !== mediaRefs.length
    if (mediaRefWasRemoved) {
      actionTaken = 'removed'
      playlist.mediaRefs = filteredMediaRefs
      playlist.itemsOrder = newItemsOrder.filter((x) => x !== mediaRefId)
    } else {
      const mediaRef = await getMediaRef(mediaRefId)
      if (!mediaRef) {
        throw new createError.NotFound('MediaRef not found')
      } else {
        actionTaken = 'added'
        const filteredMedium = getPlaylistMedium(mediaRef.episode.podcast.medium)
        if (playlist.medium !== 'mixed' && playlist.medium !== filteredMedium) {
          throw new createError.NotFound('Item can not be added to this type of playlist')
        }
        playlist.mediaRefs.push(mediaRef)
        playlist.itemsOrder.push(mediaRef.id)
      }
    }
  } else if (episodeId) {
    // If no episodes match filter, add the playlist item. Else, remove the playlist item.
    const filteredEpisodes = episodes.filter((x) => x.id !== episodeId)
    const episodeWasRemoved = filteredEpisodes.length !== episodes.length
    if (episodeWasRemoved) {
      actionTaken = 'removed'
      playlist.episodes = filteredEpisodes
      playlist.itemsOrder = newItemsOrder.filter((x) => x !== episodeId)
    } else {
      const episode = await getEpisode(episodeId)
      if (!episode) {
        throw new createError.NotFound('Episode not found')
      } else {
        actionTaken = 'added'
        const filteredMedium = getPlaylistMedium(episode.podcast.medium)
        if (playlist.medium !== 'mixed' && playlist.medium !== filteredMedium) {
          throw new createError.NotFound('Item can not be added to this type of playlist')
        }
        playlist.episodes.push(episode)
        playlist.itemsOrder.push(episode.id)
      }
    }
  } else {
    throw new createError.NotFound('Must provide a MediaRef or Episode id')
  }

  await validateClassOrThrow(playlist)

  const saved = await repository.save(playlist)

  return [saved, actionTaken]
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
  const user = await repository.findOne({
    where: {
      id: loggedInUserId
    },
    select: ['id', 'subscribedPlaylistIds']
  })

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  let subscribedPlaylistIds = user.subscribedPlaylistIds

  // If no playlistIds match the filter, add the playlistId.
  // Else, remove the playlistId.
  const filteredPlaylists = user.subscribedPlaylistIds.filter((x) => x !== playlistId)
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
  addOrRemovePlaylistItemToDefaultPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  getSubscribedPlaylists,
  toggleSubscribeToPlaylist,
  updatePlaylist
}
