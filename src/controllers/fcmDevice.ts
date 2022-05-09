import { getRepository } from 'typeorm'
import { FCMDevice, Notification } from '~/entities'
import { getLoggedInUser } from './user'
const createError = require('http-errors')

export const createFCMDevice = async (fcmToken: string, loggedInUserId: string) => {
  if (!fcmToken) {
    throw new createError.BadRequest('An fcmToken must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const user = await getLoggedInUser(loggedInUserId)
  if (!user) {
    throw new createError.NotFound(`User for id ${loggedInUserId} not found.`)
  }

  const newFCMDevice = new FCMDevice()
  newFCMDevice.fcmToken = fcmToken
  newFCMDevice.user = user

  const repository = getRepository(FCMDevice)
  await repository.save(newFCMDevice)
}

export const updateFCMDevice = async (previousFCMToken: string, nextFCMToken: string, loggedInUserId: string) => {
  if (!previousFCMToken) {
    throw new createError.BadRequest('A previous fcmToken must be provided.')
  }

  if (!nextFCMToken) {
    throw new createError.BadRequest('A new fcmToken must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const user = await getLoggedInUser(loggedInUserId)
  if (!user) {
    throw new createError.NotFound(`User for id ${loggedInUserId} not found.`)
  }

  const existingFCMDevice = await getFCMDevice(previousFCMToken, loggedInUserId)
  const repository = getRepository(FCMDevice)
  if (!existingFCMDevice) {
    const newFCMDevice = new FCMDevice()
    newFCMDevice.fcmToken = nextFCMToken
    newFCMDevice.user = user
    await repository.save(newFCMDevice)
  } else {
    const newData = { fcmToken: nextFCMToken }
    await repository.update(previousFCMToken, newData)
  }
}

export const deleteFCMDevice = async (fcmToken: string, loggedInUserId: string) => {
  if (!fcmToken) {
    throw new createError.BadRequest('An fcmToken must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const user = await getLoggedInUser(loggedInUserId)
  if (!user) {
    throw new createError.NotFound(`User for id ${loggedInUserId} not found.`)
  }

  const fcmDevice = await getFCMDevice(fcmToken, loggedInUserId)

  if (!fcmDevice) {
    throw new createError.NotFound(`fcmDevice for fcmToken ${fcmToken} not found.`)
  }

  const repository = getRepository(FCMDevice)
  await repository.remove(fcmDevice)
}

const getFCMDevice = async (fcmToken: string, loggedInUserId: string) => {
  if (!fcmToken) {
    throw new createError.BadRequest('An fcmToken must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const repository = getRepository(FCMDevice)
  return repository
    .createQueryBuilder('fcmDevices')
    .select('"fcmDevices"."fcmToken"', 'fcmToken')
    .where('"fcmToken" = :fcmToken', { fcmToken })
    .andWhere('user.id = :loggedInUserId', { loggedInUserId })
    .leftJoin('fcmDevices.user', 'user')
    .getRawOne()
}

export const getFCMTokensForPodcastId = async (podcastId: string) => {
  if (!podcastId) {
    throw new createError.BadRequest('A podcastId but be provided.')
  }

  const repository = getRepository(Notification)
  const notifications = await repository
    .createQueryBuilder('notifications')
    .select('"fcmDevices"."fcmToken", "fcmToken"')
    .innerJoin(FCMDevice, 'fcmDevices', 'notifications."userId" = "fcmDevices"."userId"')
    .where('notifications."podcastId" = :podcastId', { podcastId })
    .getRawMany()

  const fcmTokens = notifications.map((fcmDevice: FCMDevice) => fcmDevice.fcmToken)

  return fcmTokens
}
