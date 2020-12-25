import { getRepository } from 'typeorm'
import { cleanUserItemResults, generateGetUserItemsQuery } from '~/controllers/userHistoryItem'
import { UserQueueItem } from '~/entities'
import { arrayMoveItemToNewPosition } from '~/lib/utility'
const createError = require('http-errors')

export const getUserQueueItems = async (loggedInUserId) => {
  return generateGetUserItemsQuery(UserQueueItem, 'userQueueItem', loggedInUserId)
    .orderBy({ 'userQueueItem.queuePosition': 'ASC' })
    .getRawMany()
}

export const getCleanedUserQueueItems = async (loggedInUserId) => {
  const results = await getUserQueueItems(loggedInUserId)
  const userQueueItems = cleanUserItemResults(results)
  return { userQueueItems }
}

export const addOrUpdateQueueItem = async (loggedInUserId, query) => {
  const { episodeId, mediaRefId, queuePosition } = query
  
  if (!episodeId && !mediaRefId) {
    throw new createError.NotFound('An episodeId or mediaRefId must be provided.')
  }
  
  if (episodeId && mediaRefId) {
    throw new createError.NotFound('Either an episodeId or mediaRefId must be provided, but not both. Set null for the value that should not be included.')
  }
  
  if (!queuePosition && queuePosition !== 0) {
    throw new createError.NotFound('A queuePosition must be provided.')
  }

  const queueItems = await getUserQueueItems(loggedInUserId)
  const existingIndex = queueItems.findIndex((x: any) => {
    if (x.clipId && mediaRefId) {
      return x.clipId === mediaRefId
    } else {
      return x.episodeId === episodeId
    }
  })

  if (existingIndex >= 0) {
    if (queuePosition >= 0) {
      arrayMoveItemToNewPosition(queueItems, existingIndex, queuePosition)
    } else {
      // if no queuePosition provided, assume add to queue last,
      // so add to end of the array.
      const userQueueItem = new UserQueueItem()
      userQueueItem.episode = episodeId || null
      userQueueItem.mediaRef = mediaRefId || null
      userQueueItem.owner = loggedInUserId
      queueItems.push(userQueueItem)
    }
  } else {
    const userQueueItem = new UserQueueItem()
    userQueueItem.episode = episodeId || null
    userQueueItem.mediaRef = mediaRefId || null
    userQueueItem.owner = loggedInUserId
    if (queuePosition === 0) {
      queueItems.unshift(userQueueItem)
    } else if (queuePosition > 0) {
      queueItems.splice(queuePosition, 0, userQueueItem)
    } else {
      queueItems.push(userQueueItem)
    }
  }

  await updateQueueItemsPositions(queueItems)
  const newQueueItems = await getCleanedUserQueueItems(loggedInUserId)
  return newQueueItems
}

const updateQueueItemsPositions = async (queueItems) => {
  const newSortedUserQueueItems = [] as any
  for (let i = 0; i < queueItems.length; i++) {
    const item = queueItems[i]
    item.queuePosition = i
    newSortedUserQueueItems.push(item)
  }

  const repository = getRepository(UserQueueItem)
  await repository.save(newSortedUserQueueItems)
}

export const popNextFromQueue = async (loggedInUserId) => {
  const queueItems = await getUserQueueItems(loggedInUserId)
  const nextItem = queueItems.shift()
  
  if (!nextItem) {
    return {
      nextItem: null,
      userQueueItems: []
    }
  } else if (nextItem.clipId) {
    const newQueueItems = await removeUserQueueItemByMediaRefId(loggedInUserId, nextItem.clipId)
    return {
      nextItem,
      userQueueItems: newQueueItems.userQueueItems
    }
  } else {
    const newQueueItems = await removeUserQueueItemByEpisodeId(loggedInUserId, nextItem.episodeId)
    return {
      nextItem,
      userQueueItems: newQueueItems.userQueueItems
    }
  }
}

export const removeUserQueueItemByEpisodeId = async (loggedInUserId, episodeId) => {
  const queueItems = await getUserQueueItems(loggedInUserId)

  const queueItem = queueItems.find(x => x.episodeId === episodeId)
  if (!queueItem) {
    throw new createError.NotFound('UserQueueItem not found with episodeId.')
  }
  const repository = getRepository(UserQueueItem)
  await repository.remove(queueItem)

  const remainingQueueItems = await getRawQueueItems(loggedInUserId)
  await updateQueueItemsPositions(remainingQueueItems)

  const newQueueItems = await getCleanedUserQueueItems(loggedInUserId)
  return newQueueItems
}

export const removeUserQueueItemByMediaRefId = async (loggedInUserId, mediaRefId) => {
  const queueItems = await getUserQueueItems(loggedInUserId)

  const queueItem = queueItems.find(x => x.clipId === mediaRefId)
  if (!queueItem) {
    throw new createError.NotFound('UserQueueItem not found with mediaRefId.')
  }
  const repository = getRepository(UserQueueItem)
  await repository.remove(queueItem)

  const remainingQueueItems = await getRawQueueItems(loggedInUserId)
  await updateQueueItemsPositions(remainingQueueItems)

  const newQueueItems = await getCleanedUserQueueItems(loggedInUserId)
  return newQueueItems
}

const getRawQueueItems = async (loggedInUserId) => {
  const repository = getRepository(UserQueueItem)
  return repository
    .createQueryBuilder('userQueueItem')
    .select('userQueueItem.id', 'id')
    .leftJoin(`userQueueItem.owner`, 'owner')
    .where('owner.id = :loggedInUserId', { loggedInUserId }) as any
}
