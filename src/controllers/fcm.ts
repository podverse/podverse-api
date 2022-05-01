import { getRepository } from 'typeorm'
import { FCM } from '~/entities/fcm'
import { getPodcast } from './podcast'
import { getLoggedInUser } from './user'
const createError = require('http-errors')

export const getFCMsForLoggedInUser = async (loggedInUserId: string) => {
  const repository = getRepository(FCM)
  return repository
    .createQueryBuilder('fcms')
    .select('fcms.fcm', 'fcm')
    .addSelect('fcms."podcastId"', 'podcastId')
    .leftJoin(`fcms.user`, 'user')
    .where('user.id = :loggedInUserId', { loggedInUserId })
    .getRawMany()
}

export const subscribeToFCMForPodcast = async (fcmId: string, podcastId: string, loggedInUserId: string) => {
  if (!fcmId) {
    throw new createError.BadRequest('An fcm id must be provided.')
  }

  if (!podcastId) {
    throw new createError.BadRequest('A podcast id must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const podcast = await getPodcast(podcastId)
  if (!podcast) {
    throw new createError.NotFound(`Podcast for id ${podcastId} not found.`)
  }

  const user = await getLoggedInUser(loggedInUserId)
  if (!user) {
    throw new createError.NotFound(`User for id ${loggedInUserId} not found.`)
  }

  const existingFCMs = await getFCMsForLoggedInUser(loggedInUserId)
  if (existingFCMs.length > 5000) {
    throw new createError.NotFound(`Too many FCMs created for this user. Please contact tech support.`)
  }

  const newFCM = new FCM()
  newFCM.fcm = fcmId
  newFCM.podcast = podcast
  newFCM.user = user

  const repository = getRepository(FCM)
  await repository.save(newFCM)
}

export const unsubscribeToFCMForPodcast = async (fcmId: string, podcastId: string, loggedInUserId: string) => {
  if (!fcmId) {
    throw new createError.BadRequest('An fcmId must be provided.')
  }

  if (!podcastId) {
    throw new createError.BadRequest('A podcast id must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const podcast = await getPodcast(podcastId)
  if (!podcast) {
    throw new createError.NotFound(`Podcast for id ${podcastId} not found.`)
  }

  const user = await getLoggedInUser(loggedInUserId)
  if (!user) {
    throw new createError.NotFound(`User for id ${loggedInUserId} not found.`)
  }

  const repository = getRepository(FCM)

  const fcms = await repository.find({
    where: {
      fcm: fcmId,
      podcast: podcastId,
      user: loggedInUserId
    }
  })

  if (fcms.length === 0) {
    throw new createError.NotFound(`No FCMs found for fcm ${fcmId}, podcast ${podcastId}, user ${loggedInUserId}.`)
  }

  return repository.remove(fcms)
}

export const unsubscribeFCMForAllPodcasts = async (fcmValue: string, loggedInUserId: string) => {
  const repository = getRepository(FCM)

  const fcms = await repository.find({
    where: {
      fcm: fcmValue,
      user: loggedInUserId
    }
  })

  return repository.remove(fcms)
}

// export const getFCMsForPodcast = async (podcastId: string) => {
//   const repository = getRepository(FCM)
//   return repository
//     .createQueryBuilder('fcms')
//     .select('fcms.fcm', 'fcm')
//     .leftJoin(`fcms.podcast`, 'podcast')
//     .where('podcast.id = :podcastId', { podcastId })
//     .getRawMany()
// }

// export const removeAllFCMsForPocastId = async (podcastId: string) => {
//   const repository = getRepository(FCM)

//   const fcms = await repository.find({
//     where: { podcast: podcastId }
//   })

//   return repository.remove(fcms)
// }

// export const removeAllFCMsForUser = async (loggedInUserId: string) => {
//   const repository = getRepository(FCM)

//   const fcms = await repository.find({
//     where: { user: loggedInUserId }
//   })

//   return repository.remove(fcms)
// }
