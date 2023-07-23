import { getRepository } from 'typeorm'
import { UPDevice, Notification } from '~/entities'
import { getLoggedInUser } from './user'
import { UPEndpointData } from '~/entities/upDevice'
const createError = require('http-errors')

export const createUPDevice = async ({
  upEndpoint,
  upPublicKey,
  upAuthKey,
  loggedInUserId
}: {
  upEndpoint: string
  upPublicKey: string
  upAuthKey: string
  loggedInUserId: string
}) => {
  if (!upEndpoint) {
    throw new createError.BadRequest('An upEndpoint must be provided.')
  }

  if (!upPublicKey) {
    throw new createError.BadRequest('An upPublicKey must be provided.')
  }

  if (!upAuthKey) {
    throw new createError.BadRequest('An upAuthKey must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const user = await getLoggedInUser(loggedInUserId)
  if (!user) {
    throw new createError.NotFound(`User for id ${loggedInUserId} not found.`)
  }

  const newUPDevice = new UPDevice()
  newUPDevice.upEndpoint = upEndpoint
  newUPDevice.upPublicKey = upPublicKey
  newUPDevice.upAuthKey = upAuthKey
  newUPDevice.user = user

  const repository = getRepository(UPDevice)
  await repository.save(newUPDevice)
}

export const updateUPDevice = async ({
  previousUPEndpoint,
  nextUPEndpoint,
  upPublicKey,
  upAuthKey,
  loggedInUserId
}: {
  previousUPEndpoint
  nextUPEndpoint
  upPublicKey
  upAuthKey
  loggedInUserId
}) => {
  if (!previousUPEndpoint) {
    throw new createError.BadRequest('A previous upEndpoint must be provided.')
  }

  if (!nextUPEndpoint) {
    throw new createError.BadRequest('A new upEndpoint must be provided.')
  }

  if (!upPublicKey) {
    throw new createError.BadRequest('A new upPublicKey must be provided.')
  }

  if (!upAuthKey) {
    throw new createError.BadRequest('A new upAuthKey must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const user = await getLoggedInUser(loggedInUserId)
  if (!user) {
    throw new createError.NotFound(`User for id ${loggedInUserId} not found.`)
  }

  const existingUPDevice = await getUPDevice(previousUPEndpoint, loggedInUserId)
  const repository = getRepository(UPDevice)
  if (!existingUPDevice) {
    const newUPDevice = new UPDevice()
    newUPDevice.upEndpoint = nextUPEndpoint
    newUPDevice.upPublicKey = upPublicKey
    newUPDevice.upAuthKey = upAuthKey
    newUPDevice.user = user
    await repository.save(newUPDevice)
  } else {
    const newData = { upEndpoint: nextUPEndpoint, upPublicKey, upAuthKey }
    await repository.update(previousUPEndpoint, newData)
  }
}

export const deleteUPDevice = async (upEndpoint: string, loggedInUserId: string) => {
  if (!upEndpoint) {
    throw new createError.BadRequest('An upEndpoint must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const user = await getLoggedInUser(loggedInUserId)
  if (!user) {
    throw new createError.NotFound(`User for id ${loggedInUserId} not found.`)
  }

  const upDevice = await getUPDevice(upEndpoint, loggedInUserId)

  if (!upDevice) {
    throw new createError.NotFound(`upDevice for upEndpoint ${upEndpoint} not found.`)
  }

  const repository = getRepository(UPDevice)
  await repository.remove(upDevice)
}

const getUPDevice = async (upEndpoint: string, loggedInUserId: string) => {
  if (!upEndpoint) {
    throw new createError.BadRequest('An upEndpoint must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const repository = getRepository(UPDevice)
  return repository
    .createQueryBuilder('upDevices')
    .select('"upDevices"."upEndpoint"', 'upEndpoint')
    .where('"upEndpoint" = :upEndpoint', { upEndpoint })
    .andWhere('user.id = :loggedInUserId', { loggedInUserId })
    .leftJoin('upDevices.user', 'user')
    .getRawOne()
}

export const getUPEndpointsForPodcastId = async (podcastId: string) => {
  if (!podcastId) {
    throw new createError.BadRequest('A podcastId but be provided.')
  }

  const repository = getRepository(Notification)
  const notifications = await repository
    .createQueryBuilder('notifications')
    .select('"upDevices"."upEndpoint", "upEndpoint"')
    .innerJoin(UPDevice, 'upDevices', 'notifications."userId" = "upDevices"."userId"')
    .where('notifications."podcastId" = :podcastId', { podcastId })
    .getRawMany()

  const upEndpoints = notifications.map((upDevice: UPDevice) => upDevice.upEndpoint)

  return upEndpoints
}

export const getUPDevicesForPodcastId = async (
  podcastId: string
  ): Promise<UPEndpointData[]> => {
  if (!podcastId) {
    throw new createError.BadRequest('A podcastId but be provided.')
  }

  const repository = getRepository(Notification)
  return await repository
    .createQueryBuilder('notifications')
    .select(
      '"upDevices"."upEndpoint" AS "upEndpoint", "upDevices"."upPublicKey" AS "upPublicKey", "upDevices"."upAuthKey" AS "upAuthKey"',
    )
    .innerJoin(UPDevice, 'fcmDevices', 'notifications."userId" = "upDevices"."userId"')
    .where('notifications."podcastId" = :podcastId', { podcastId })
    .getRawMany()
}