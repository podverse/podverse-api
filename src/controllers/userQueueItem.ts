import { getRepository } from 'typeorm'
import { cleanUserItemResult, cleanUserItemResults, generateGetUserItemsQuery } from '~/controllers/userHistoryItem'
import { UserQueueItem } from '~/entities'
const createError = require('http-errors')

export const getUserQueueItems = async (loggedInUserId, medium) => {
  return generateGetUserItemsQuery(UserQueueItem, 'userQueueItem', medium, loggedInUserId)
    .orderBy({ 'userQueueItem.queuePosition': 'ASC' })
    .where('medium = :medium', { medium })
    .getRawMany()
}

export const getCleanedUserQueueItems = async (loggedInUserId, medium) => {
  const results = await getUserQueueItems(loggedInUserId, medium)
  const userQueueItems = cleanUserItemResults(results)
  return { userQueueItems }
}

export const addOrUpdateQueueItem = async (loggedInUserId, query, medium) => {
  const { episodeId, mediaRefId, queuePosition } = query

  if (!episodeId && !mediaRefId) {
    throw new createError.NotFound('An episodeId or mediaRefId must be provided.')
  }

  if (episodeId && mediaRefId) {
    throw new createError.NotFound(
      'Either an episodeId or mediaRefId must be provided, but not both. Set null for the value that should not be included.'
    )
  }

  if (!queuePosition && queuePosition !== 0) {
    throw new createError.NotFound('A queuePosition must be provided.')
  }

  const queueItems = await getUserQueueItems(loggedInUserId, medium)
  const existingIndex = queueItems.findIndex((x: any) => {
    if (x.clipId && mediaRefId) {
      return x.clipId === mediaRefId
    } else {
      return x.episodeId === episodeId
    }
  })

  // If the item is already in the queue, then remove it from the queue,
  // then insert the item with the new queuePosition.
  // Else, initialize a new UserQueueItem.
  let userQueueItem
  if (existingIndex >= 0) {
    userQueueItem = queueItems[existingIndex]
    queueItems.splice(existingIndex, 1)
  }

  userQueueItem = userQueueItem || new UserQueueItem()
  userQueueItem.episode = episodeId || null
  userQueueItem.mediaRef = mediaRefId || null
  userQueueItem.owner = loggedInUserId
  userQueueItem.queuePosition = queuePosition
  queueItems.push(userQueueItem)

  const sortedQueueItems = queueItems.sort((a, b) => a.queuePosition - b.queuePosition)

  await updateQueueItemsPositions(sortedQueueItems)
  const newQueueItems = await getCleanedUserQueueItems(loggedInUserId, medium)
  return newQueueItems
}

const updateQueueItemsPositions = async (queueItemsWithMedium) => {
  const newSortedUserQueueItems = [] as any
  const queuePositionInterval = 1000

  for (let i = 0; i < queueItemsWithMedium.length; i++) {
    const item = queueItemsWithMedium[i]
    item.queuePosition = (i + 1) * queuePositionInterval
    newSortedUserQueueItems.push(item)
  }

  const repository = getRepository(UserQueueItem)
  await repository.save(newSortedUserQueueItems)
}

export const popNextFromQueue = async (loggedInUserId, medium) => {
  const queueItems = await getUserQueueItems(loggedInUserId, medium)
  let nextItem = queueItems.shift()

  if (!nextItem) {
    return {
      nextItem: null,
      userQueueItems: []
    }
  } else if (nextItem.clipId) {
    nextItem = cleanUserItemResult(nextItem)
    const newQueueItems = await removeUserQueueItemByMediaRefId(loggedInUserId, nextItem.clipId, medium)
    return {
      nextItem,
      userQueueItems: newQueueItems.userQueueItems
    }
  } else {
    nextItem = cleanUserItemResult(nextItem)
    const newQueueItems = await removeUserQueueItemByEpisodeId(loggedInUserId, nextItem.episodeId, medium)
    return {
      nextItem,
      userQueueItems: newQueueItems.userQueueItems
    }
  }
}

export const removeUserQueueItemByEpisodeId = async (loggedInUserId, episodeId, medium) => {
  const queueItems = await getUserQueueItems(loggedInUserId, medium)

  const queueItem = queueItems.find((x) => x.episodeId === episodeId)
  if (!queueItem) {
    // UserQueueItem not found with episodeId.
    return queueItems
  }
  const repository = getRepository(UserQueueItem)
  await repository.remove(queueItem)

  const remainingQueueItems = await getRawQueueItems(loggedInUserId, medium)
  await updateQueueItemsPositions(remainingQueueItems)

  const newQueueItems = await getCleanedUserQueueItems(loggedInUserId, medium)
  return newQueueItems
}

export const removeUserQueueItemByMediaRefId = async (loggedInUserId, mediaRefId, medium) => {
  const queueItems = await getUserQueueItems(loggedInUserId, medium)

  const queueItem = queueItems.find((x) => x.clipId === mediaRefId)
  if (!queueItem) {
    // UserQueueItem not found with mediaRefId.
    return queueItems
  }
  const repository = getRepository(UserQueueItem)
  await repository.remove(queueItem)

  const remainingQueueItems = await getRawQueueItems(loggedInUserId, medium)
  await updateQueueItemsPositions(remainingQueueItems)

  const newQueueItems = await getCleanedUserQueueItems(loggedInUserId, medium)
  return newQueueItems
}

export const removeAllUserQueueItems = async (loggedInUserId, medium) => {
  const repository = getRepository(UserQueueItem)

  const userQueueItems = await repository.find({
    where: {
      owner: loggedInUserId,
      medium
    }
  })

  return repository.remove(userQueueItems)
}

const getRawQueueItems = async (loggedInUserId, medium) => {
  const repository = getRepository(UserQueueItem)
  return repository
    .createQueryBuilder('userQueueItem')
    .select('userQueueItem.id', 'id')
    .leftJoin(`userQueueItem.owner`, 'owner')
    .where('owner.id = :loggedInUserId', { loggedInUserId })
    .andWhere('userQueueItem.medium = :medium', { medium })
    .orderBy('userQueueItem.queuePosition', 'ASC')
    .getRawMany() as any
}
