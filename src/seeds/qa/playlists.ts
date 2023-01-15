import { faker } from '@faker-js/faker'
import { getRepository } from 'typeorm'
import { Episode, MediaRef } from '~/entities'
import {
  getQAUserByEmail,
  userFreeTrialExpiredEmail,
  userFreeTrialValidEmail,
  userPremiumExpiredEmail,
  userPremiumValidEmail
} from './users'
import { _logEnd, _logStart, logPerformance } from '~/lib/utility'
import { addOrRemovePlaylistItem, createPlaylist } from '~/controllers/playlist'

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
  const episodeRepository = getRepository(Episode)
  const mediaRefRepository = getRepository(MediaRef)

  const episodes = await episodeRepository
    .createQueryBuilder('episode')
    .select('episode.id')
    .where('episode."isPublic" = TRUE')
    .orderBy('RANDOM()')
    .limit(100)
    .getMany()

  const episodeIdsFull = episodes.map((episode) => episode.id)

  const mediaRefs = await mediaRefRepository.find({
    select: ['id'],
    where: {
      isPublic: true
    },
    take: 100
  })

  const mediaRefIdsFull = mediaRefs.map((mediaRef) => mediaRef.id)

  for (let i = 0; i < 10; i++) {
    const playlistLite: PlaylistLite = {
      owner: userId,
      description: getRandomDescription(),
      isPublic: true,
      title: getRandomTitle()
    }

    const playlist = await createPlaylist(playlistLite)

    const rangeStart = i * 10
    const rangeEnd = (i + 1) * 10
    const episodeIds = episodeIdsFull.slice(rangeStart, rangeEnd)
    const mediaRefIds = mediaRefIdsFull.slice(rangeStart, rangeEnd)

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
