import { getRepository } from 'typeorm'
import { Notification } from '~/entities'
import { getPodcast } from './podcast'
import { getLoggedInUser } from './user'
const createError = require('http-errors')

export const createNotification = async (podcastId: string, loggedInUserId: string) => {
  if (!podcastId) {
    throw new createError.BadRequest('An podcastId must be provided.')
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

  const newNotification = new Notification()
  newNotification.podcast = podcast
  newNotification.user = user

  const repository = getRepository(Notification)
  await repository.save(newNotification)
}

export const deleteNotification = async (podcastId: string, loggedInUserId: string) => {
  if (!podcastId) {
    throw new createError.BadRequest('A podcastId must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const user = await getLoggedInUser(loggedInUserId)
  if (!user) {
    throw new createError.NotFound(`User for id ${loggedInUserId} not found.`)
  }

  const notification = await getNotification(podcastId, loggedInUserId)
  if (!notification) {
    throw new createError.NotFound(`notification for podcastId ${podcastId} and user id ${loggedInUserId} not found.`)
  }

  const repository = getRepository(Notification)
  await repository.remove(notification)
}

const getNotification = (podcastId: string, loggedInUserId: string) => {
  if (!podcastId) {
    throw new createError.BadRequest('A podcastId must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.BadRequest('A user id must be provided.')
  }

  const repository = getRepository(Notification)
  return repository.findOne({
    where: {
      podcast: podcastId,
      user: loggedInUserId
    },
    relations: ['podcast', 'user']
  })
}
