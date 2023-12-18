import { faker } from '@faker-js/faker'
import { addOrRemovePlaylistItem, addOrRemovePlaylistItemToDefaultPlaylist, createPlaylist } from 'podverse-orm'
import { logPerformance, _logEnd, _logStart } from 'podverse-shared'
import { getRandomMediaRefIds } from './mediaRefs'
import { getRandomEpisodeIds } from './episodes'
import { generateQAItemsForUsers, getQABatchRange } from './utility'

type PlaylistLite = {
  owner: string
  description: string
  isPublic: boolean
  title: string
}

export const generateQAPlaylists = async () => {
  logPerformance('generateQAPlaylists', _logStart)
  await generateQAItemsForUsers(generatePlaylistsForUser)
  logPerformance('generateQAPlaylists', _logEnd)
}

const generatePlaylistsForUser = async (userId: string) => {
  const episodeIdsFull = await getRandomEpisodeIds()
  const mediaRefIdsFull = await getRandomMediaRefIds()

  for (let i = 0; i < 5; i++) {
    const playlistLite: PlaylistLite = {
      owner: userId,
      description: getRandomDescription(),
      isPublic: true,
      title: getRandomTitle()
    }

    const playlist = await createPlaylist(playlistLite)
    const episodeIds = getQABatchRange(episodeIdsFull, i)
    const mediaRefIds = getQABatchRange(mediaRefIdsFull, i)

    for (let i = 0; i < 5; i++) {
      await addOrRemovePlaylistItem(playlist.id, '', episodeIds[i], userId)
      await addOrRemovePlaylistItem(playlist.id, mediaRefIds[i], '', userId)
    }
  }

  for (let j = 5; j < 10; j++) {
    const episodeIds = getQABatchRange(episodeIdsFull, j)
    const mediaRefIds = getQABatchRange(mediaRefIdsFull, j)

    for (let j = 5; j < 10; j++) {
      await addOrRemovePlaylistItemToDefaultPlaylist('', episodeIds[j], userId)
      await addOrRemovePlaylistItemToDefaultPlaylist(mediaRefIds[j], '', userId)
    }
  }
}

const getRandomTitle = () => {
  const numberOfWords = faker.datatype.number({ min: 0, max: 20 })
  return faker.lorem.words(numberOfWords)
}

const getRandomDescription = () => {
  const numberOfWords = faker.datatype.number({ min: 0, max: 100 })
  return faker.lorem.words(numberOfWords)
}
