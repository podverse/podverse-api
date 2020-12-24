import { getRepository } from 'typeorm'
import { UserHistoryItem } from '~/entities'
const createError = require('http-errors')

export const cleanUserItemResult = (result) => {
  if (result.clipId) {
    return {
      clipEndTime: result.clipEndTime,
      clipId: result.clipId,
      clipStartTime: result.clipStartTime,
      clipTitle: result.clipTitle,
      episodeDescription: result.clipEpisodeDescription,
      episodeDuration: result.clipEpisodeDuration,
      episodeId: result.clipEpisodeId,
      episodeTitle: result.clipEpisodeTitle,
      id: result.id,
      podcastId: result.clipPodcastId,
      podcastTitle: result.clipPodcastTitle
    }
  } else {
    return {
      episodeDescription: result.episodeDescription,
      episodeDuration: result.episodeDuration,
      episodeId: result.episodeId,
      episodeTitle: result.episodeTitle,
      id: result.id,
      lastPlaybackPosition: result.lastPlaybackPosition,
      podcastId: result.podcastId,
      podcastTitle: result.podcastTitle
    }
  }
}

export const cleanUserItemResults = (results) => {
  const cleanedResults = [] as any
  for (const result of results) {
    cleanedResults.push(cleanUserItemResult(result))
  }

  return cleanedResults
}

export const generateGetUserItemsQuery = (table, tableName, loggedInUserId) => {
  const qb = getRepository(table)
    .createQueryBuilder(`${tableName}`)
    .select(`${tableName}.id`, 'id')
  
  if (tableName === 'userHistoryItem') {
    qb.addSelect(`${tableName}.lastPlaybackPosition`, 'lastPlaybackPosition')
      .addSelect(`${tableName}.orderChangedDate`, 'orderChangedDate')
  }

  return qb
    .addSelect('mediaRef.id', 'clipId')
    .addSelect('mediaRef.title', 'clipTitle')
    .addSelect('mediaRef.startTime', 'clipStartTime')
    .addSelect('mediaRef.endTime', 'clipEndTime')
    .addSelect('episode.id', 'episodeId')
    .addSelect('episode.description', 'episodeDescription')
    .addSelect('episode.duration', 'episodeDuration')
    .addSelect('episode.title', 'episodeTitle')
    .addSelect('podcast.id', 'podcastId')
    .addSelect('podcast.title', 'podcastTitle')
    .addSelect('clipEpisode.id', 'clipEpisodeId')
    .addSelect('clipEpisode.description', 'clipEpisodeDescription')
    .addSelect('clipEpisode.duration', 'clipEpisodeDuration')
    .addSelect('clipEpisode.title', 'clipEpisodeTitle')
    .addSelect('clipPodcast.id', 'clipPodcastId')
    .addSelect('clipPodcast.title', 'clipPodcastTitle')
    .leftJoin(`${tableName}.episode`, 'episode')
    .leftJoin('episode.podcast', 'podcast')
    .leftJoin(`${tableName}.mediaRef`, 'mediaRef')
    .leftJoin('mediaRef.episode', 'clipEpisode')
    .leftJoin('clipEpisode.podcast', 'clipPodcast')
    .leftJoin(`${tableName}.owner`, 'owner')
    .where('owner.id = :loggedInUserId', { loggedInUserId }) as any
}

export const getUserHistoryItems = async (loggedInUserId, query) => {
  const { skip, take } = query
  const results = await generateGetUserItemsQuery(UserHistoryItem, 'userHistoryItem', loggedInUserId) 
    .orderBy({ 'userHistoryItem.orderChangedDate': 'DESC' })
    .skip(skip)
    .take(take)
    .getRawMany()

  return cleanUserItemResults(results)
}

export const getUserHistoryItemsMetadata = async (loggedInUserId) => {
  const repository = getRepository(UserHistoryItem)

  return repository
    .createQueryBuilder('userHistoryItem')
    .select('userHistoryItem.lastPlaybackPosition', 'lastPlaybackPosition')
    .addSelect('mediaRef.id', 'mediaRefId')
    .addSelect('episode.id', 'episodeId')
    .leftJoin('userHistoryItem.mediaRef', 'mediaRef')
    .leftJoin('userHistoryItem.episode', 'episode')
    .leftJoin('userHistoryItem.owner', 'owner')
    .where('owner.id = :loggedInUserId', { loggedInUserId })
    .orderBy({ 'userHistoryItem.orderChangedDate': 'DESC' })
    .getRawMany()
}

export const addOrUpdateHistoryItem = async (loggedInUserId, query) => {
  const { episodeId, forceUpdateOrderDate, lastPlaybackPosition, mediaRefId } = query

  if (!episodeId && !mediaRefId) {
    throw new createError.NotFound('An episodeId or mediaRefId must be provided.')
  }

  if (episodeId && mediaRefId) {
    throw new createError.NotFound('Either an episodeId or mediaRefId must be provided, but not both. Set null for the value that should not be included.')
  }

  if (!lastPlaybackPosition && lastPlaybackPosition !== 0) {
    throw new createError.NotFound('A lastPlaybackPosition must be provided.')
  }

  const repository = getRepository(UserHistoryItem)

  let userHistoryItem
  if (mediaRefId) {
    userHistoryItem = await repository
      .createQueryBuilder('userHistoryItem')
      .select('userHistoryItem.id', 'id')
      .addSelect('userHistoryItem.lastPlaybackPosition', 'lastPlaybackPosition')
      .leftJoin('userHistoryItem.mediaRef', 'mediaRef')
      .leftJoin('userHistoryItem.owner', 'owner')
      .where('owner.id = :loggedInUserId', { loggedInUserId })
      .andWhere('mediaRef.id = :mediaRefId', { mediaRefId })
      .getRawOne()
  } else {
    userHistoryItem = await repository
      .createQueryBuilder('userHistoryItem')
      .select('userHistoryItem.id', 'id')
      .addSelect('userHistoryItem.lastPlaybackPosition', 'lastPlaybackPosition')
      .leftJoin('userHistoryItem.episode', 'episode')
      .leftJoin('userHistoryItem.mediaRef', 'mediaRef')
      .leftJoin('userHistoryItem.owner', 'owner')
      .where('owner.id = :loggedInUserId', { loggedInUserId })
      .andWhere('episode.id = :episodeId', { episodeId })
      .andWhere('mediaRef.id IS NULL')
      .getRawOne()
  }

  userHistoryItem = userHistoryItem ? userHistoryItem : new UserHistoryItem()
  userHistoryItem.lastPlaybackPosition = lastPlaybackPosition
  userHistoryItem.episode = episodeId || null
  userHistoryItem.mediaRef = mediaRefId || null
  userHistoryItem.owner = loggedInUserId
  userHistoryItem.orderChangedDate =
    forceUpdateOrderDate
    ? new Date()
    : userHistoryItem.orderChangedDate

  await repository.save(userHistoryItem)
}

const getUserHistoryItemByEpisodeId = async (loggedInUserId, episodeId) => {
  const repository = getRepository(UserHistoryItem)

  return repository
    .createQueryBuilder('userHistoryItem')
    .select('userHistoryItem.id', 'id')
    .addSelect('episode.id', 'episodeId')
    .leftJoin('userHistoryItem.episode', 'episode')
    .leftJoin('userHistoryItem.owner', 'owner')
    .where('owner.id = :loggedInUserId', { loggedInUserId })
    .andWhere('episode.id = :episodeId', { episodeId })
    .orderBy({ 'userHistoryItem.orderChangedDate': 'DESC' })
    .getRawOne()
}

const getUserHistoryItemByMediaRefId = async (loggedInUserId, mediaRefId) => {
  const repository = getRepository(UserHistoryItem)  

  return repository
    .createQueryBuilder('userHistoryItem')
    .select('userHistoryItem.id', 'id')
    .addSelect('mediaRef.id', 'mediaRefId')
    .leftJoin('userHistoryItem.mediaRef', 'mediaRef')
    .leftJoin('userHistoryItem.owner', 'owner')
    .where('owner.id = :loggedInUserId', { loggedInUserId })
    .andWhere('mediaRef.id = :mediaRefId', { mediaRefId })
    .orderBy({ 'userHistoryItem.orderChangedDate': 'DESC' })
    .getRawOne()
}

export const removeUserHistoryItem = async (loggedInUserId, idObj) => {
  const { episodeId, mediaRefId } = idObj
  const repository = getRepository(UserHistoryItem)
  let userHistoryItem

  if (mediaRefId) {
    userHistoryItem = await getUserHistoryItemByMediaRefId(loggedInUserId, mediaRefId)
  } else if (episodeId) {
    userHistoryItem = await getUserHistoryItemByEpisodeId(loggedInUserId, episodeId)
  }

  if (!userHistoryItem) {
    throw new createError.NotFound('UserHistoryItem not found.')
  }

  return repository.delete({ id: userHistoryItem.id })
}

export const removeUserHistoryItemByEpisodeId = async (loggedInUserId, episodeId) => {
  const repository = getRepository(UserHistoryItem)
  const userHistoryItem = await getUserHistoryItemByEpisodeId(loggedInUserId, episodeId)

  if (!userHistoryItem) {
    throw new createError.NotFound('UserHistoryItem not found.')
  }

  return repository.delete({ id: userHistoryItem.id })
}

export const removeUserHistoryItemByMediaRefId = async (loggedInUserId, mediaRefId) => {
  const repository = getRepository(UserHistoryItem)
  const userHistoryItem = await getUserHistoryItemByMediaRefId(loggedInUserId, mediaRefId)

  if (!userHistoryItem) {
    throw new createError.NotFound('UserHistoryItem not found.')
  }

  return repository.delete({ id: userHistoryItem.id })
}

export const removeAllUserHistoryItems = async (loggedInUserId) => {
  const repository = getRepository(UserHistoryItem)

  const userHistoryItems = await repository.find({
    where: { owner: loggedInUserId }
  })

  return repository.remove(userHistoryItems)
}
