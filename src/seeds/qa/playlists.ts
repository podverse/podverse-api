import { faker } from '@faker-js/faker'
import {
  getQAUserByEmail,
  userFreeTrialExpiredEmail,
  userFreeTrialValidEmail,
  userPremiumExpiredEmail,
  userPremiumValidEmail
} from './users'
import { _logEnd, _logStart, logPerformance } from '~/lib/utility'
import { addOrRemovePlaylistItem, createPlaylist } from '~/controllers/playlist'
import { getRandomMediaRefIds } from './mediaRefs'
import { getRandomEpisodeIds } from './episodes'
import { getQABatchRange } from './utility'

type PlaylistLite = {
  owner: string
  description: string
  isPublic: boolean
  title: string
}

export const generateQAPlaylists = async () => {
  logPerformance('generateQAPlaylists', _logStart)

  const userFreeTrialValid = await getQAUserByEmail(userFreeTrialValidEmail)
  const userFreeTrialExpired = await getQAUserByEmail(userFreeTrialExpiredEmail)
  const userPremiumValid = await getQAUserByEmail(userPremiumValidEmail)
  const userPremiumExpired = await getQAUserByEmail(userPremiumExpiredEmail)

  if (userFreeTrialValid && userFreeTrialExpired && userPremiumValid && userPremiumExpired) {
    await generatePlaylistsForUser(userFreeTrialValid.id)
    await generatePlaylistsForUser(userFreeTrialExpired.id)
    await generatePlaylistsForUser(userPremiumValid.id)
    await generatePlaylistsForUser(userPremiumExpired.id)
  }

  logPerformance('generateQAPlaylists', _logEnd)
}

const generatePlaylistsForUser = async (userId: string) => {
  const episodeIdsFull = await getRandomEpisodeIds()
  const mediaRefIdsFull = await getRandomMediaRefIds()

  for (let i = 0; i < 10; i++) {
    const playlistLite: PlaylistLite = {
      owner: userId,
      description: getRandomDescription(),
      isPublic: true,
      title: getRandomTitle()
    }

    const playlist = await createPlaylist(playlistLite)
    const episodeIds = getQABatchRange(episodeIdsFull, i)
    const mediaRefIds = getQABatchRange(mediaRefIdsFull, i)

    for (let i = 0; i < 10; i++) {
      await addOrRemovePlaylistItem(playlist.id, '', episodeIds[i], userId)
      await addOrRemovePlaylistItem(playlist.id, mediaRefIds[i], '', userId)
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
