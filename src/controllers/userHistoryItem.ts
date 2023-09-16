import { getRepository } from 'typeorm'
import { Episode, UserHistoryItem } from '~/entities'
import { parseProp } from '~/lib/utility'
const createError = require('http-errors')

export const cleanUserItemResult = (result) => {
  if (result.clipId) {
    return {
      clipEndTime: result.clipEndTime,
      clipId: result.clipId,
      clipStartTime: result.clipStartTime,
      clipTitle: result.clipTitle,
      completed: result.completed,
      episodeChaptersUrl: result.clipEpisodeChaptersUrl,
      episodeDescription: result.clipEpisodeDescription,
      episodeDuration: result.mediaFileDuration || result.clipEpisodeDuration || null,
      episodeFunding: parseProp(result, 'clipEpisodeFunding', []),
      episodeGuid: result.clipEpisodeGuid,
      episodeId: result.clipEpisodeId,
      episodeImageUrl: result.clipEpisodeImageUrl,
      episodeMediaType: result.clipEpisodeMediaType,
      episodeMediaUrl: result.clipEpisodeMediaUrl,
      episodePubDate: result.clipEpisodePubDate,
      episodeSocialInteraction: parseProp(result, 'clipEpisodeSocialInteraction', []),
      episodeSubtitle: result.clipEpisodeSubtitle,
      episodeTitle: result.clipEpisodeTitle,
      episodeTranscript: parseProp(result, 'clipEpisodeTranscript', []),
      episodeValue: parseProp(result, 'clipEpisodeValue', []),
      id: result.id,
      podcastFunding: parseProp(result, 'clipPodcastFunding', []),
      podcastId: result.clipPodcastId,
      podcastImageUrl: result.clipPodcastImageUrl,
      podcastIndexPodcastId: result.clipPodcastIndexId,
      podcastGuid: result.clipPodcastGuid,
      podcastShrunkImageUrl: result.clipPodcastShrunkImageUrl,
      podcastTitle: result.clipPodcastTitle,
      podcastValue: parseProp(result, 'clipPodcastValue', []),
      ...(result.completed ? { completed: true } : {}),
      ...(result.queuePosition || result.queuePosition === 0 ? { queuePosition: result.queuePosition } : {})
    }
  } else {
    let liveItem: any = null
    if (result.liveItem_id) {
      liveItem = {
        end: result.liveItem_end,
        start: result.liveItem_start,
        status: result.liveItem_status
      }
    }

    return {
      episodeChaptersUrl: result.episodeChaptersUrl,
      episodeDescription: result.episodeDescription,
      episodeDuration: result.mediaFileDuration || result.episodeDuration || null,
      episodeFunding: parseProp(result, 'episodeFunding', []),
      episodeGuid: result.episodeGuid,
      episodeId: result.episodeId,
      episodeImageUrl: result.episodeImageUrl,
      episodeMediaType: result.episodeMediaType,
      episodeMediaUrl: result.episodeMediaUrl,
      episodePubDate: result.episodePubDate,
      episodeSocialInteraction: parseProp(result, 'episodeSocialInteraction', []),
      episodeSubtitle: result.episodeSubtitle,
      episodeTitle: result.episodeTitle,
      episodeTranscript: parseProp(result, 'episodeTranscript', []),
      episodeValue: parseProp(result, 'episodeValue', []),
      id: result.id,
      ...(liveItem ? { liveItem } : {}),
      podcastFunding: parseProp(result, 'podcastFunding', []),
      podcastId: result.podcastId,
      podcastImageUrl: result.podcastImageUrl,
      podcastIndexPodcastId: result.podcastPodcastIndexId,
      podcastGuid: result.podcastGuid,
      podcastShrunkImageUrl: result.podcastShrunkImageUrl,
      podcastTitle: result.podcastTitle,
      podcastValue: parseProp(result, 'podcastValue', []),
      ...(result.completed ? { completed: true } : {}),
      ...(result.userPlaybackPosition || result.userPlaybackPosition === 0
        ? { userPlaybackPosition: result.userPlaybackPosition }
        : {}),
      ...(result.queuePosition || result.queuePosition === 0 ? { queuePosition: result.queuePosition } : {})
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
  const qb = getRepository(table).createQueryBuilder(`${tableName}`).select(`${tableName}.id`, 'id')

  if (tableName === 'userHistoryItem') {
    qb.addSelect(`${tableName}.completed`, 'completed')
      .addSelect(`${tableName}.mediaFileDuration`, 'mediaFileDuration')
      .addSelect(`${tableName}.orderChangedDate`, 'orderChangedDate')
      .addSelect(`${tableName}.userPlaybackPosition`, 'userPlaybackPosition')
  } else if (tableName === 'userQueueItem') {
    qb.addSelect(`${tableName}.queuePosition`, 'queuePosition')
  }

  return qb
    .addSelect('mediaRef.id', 'clipId')
    .addSelect('mediaRef.title', 'clipTitle')
    .addSelect('mediaRef.startTime', 'clipStartTime')
    .addSelect('mediaRef.endTime', 'clipEndTime')
    .addSelect('episode.id', 'episodeId')
    .addSelect('episode.alternateEnclosures', 'episodeAlternateEnclosures')
    .addSelect('episode.chaptersUrl', 'episodeChaptersUrl')
    .addSelect('episode.contentLinks', 'episodeContentLinks')
    .addSelect('episode.description', 'episodeDescription')
    .addSelect('episode.duration', 'episodeDuration')
    .addSelect('episode.funding', 'episodeFunding')
    .addSelect('episode.guid', 'episodeGuid')
    .addSelect('episode.imageUrl', 'episodeImageUrl')
    .addSelect('episode.mediaType', 'episodeMediaType')
    .addSelect('episode.mediaUrl', 'episodeMediaUrl')
    .addSelect('episode.pubDate', 'episodePubDate')
    .addSelect('episode.socialInteraction', 'episodeSocialInteraction')
    .addSelect('episode.subtitle', 'episodeSubtitle')
    .addSelect('episode.title', 'episodeTitle')
    .addSelect('episode.transcript', 'episodeTranscript')
    .addSelect('episode.value', 'episodeValue')
    .addSelect('podcast.funding', 'podcastFunding')
    .addSelect('podcast.id', 'podcastId')
    .addSelect('podcast.imageUrl', 'podcastImageUrl')
    .addSelect('podcast.podcastIndexId', 'podcastPodcastIndexId')
    .addSelect('podcast.podcastGuid', 'podcastGuid')
    .addSelect('podcast.shrunkImageUrl', 'podcastShrunkImageUrl')
    .addSelect('podcast.title', 'podcastTitle')
    .addSelect('podcast.value', 'podcastValue')
    .addSelect('clipEpisode.id', 'clipEpisodeId')
    .addSelect('clipEpisode.alternateEnclosures', 'clipEpisodeAlternateEnclosures')
    .addSelect('clipEpisode.chaptersUrl', 'clipEpisodeChaptersUrl')
    .addSelect('clipEpisode.contentLinks', 'clipEpisodeContentLinks')
    .addSelect('clipEpisode.description', 'clipEpisodeDescription')
    .addSelect('clipEpisode.duration', 'clipEpisodeDuration')
    .addSelect('clipEpisode.funding', 'clipEpisodeFunding')
    .addSelect('clipEpisode.guid', 'clipEpisodeGuid')
    .addSelect('clipEpisode.imageUrl', 'clipEpisodeImageUrl')
    .addSelect('clipEpisode.mediaType', 'clipEpisodeMediaType')
    .addSelect('clipEpisode.mediaUrl', 'clipEpisodeMediaUrl')
    .addSelect('clipEpisode.pubDate', 'clipEpisodePubDate')
    .addSelect('clipEpisode.socialInteraction', 'clipEpisodeSocialInteraction')
    .addSelect('clipEpisode.subtitle', 'clipEpisodeSubtitle')
    .addSelect('clipEpisode.title', 'clipEpisodeTitle')
    .addSelect('clipEpisode.transcript', 'clipEpisodeTranscript')
    .addSelect('clipEpisode.value', 'clipEpisodeValue')
    .addSelect('clipPodcast.id', 'clipPodcastId')
    .addSelect('clipPodcast.funding', 'clipPodcastFunding')
    .addSelect('clipPodcast.imageUrl', 'clipPodcastImageUrl')
    .addSelect('clipPodcast.podcastIndexId', 'clipPodcastIndexId')
    .addSelect('clipPodcast.podcastGuid', 'clipPodcastGuid')
    .addSelect('clipPodcast.shrunkImageUrl', 'clipPodcastShrunkImageUrl')
    .addSelect('clipPodcast.title', 'clipPodcastTitle')
    .addSelect('clipPodcast.value', 'clipPodcastValue')
    .leftJoin(`${tableName}.episode`, 'episode')
    .leftJoinAndSelect(`episode.liveItem`, 'liveItem')
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
    .orderBy('userHistoryItem.orderChangedDate', 'DESC')
    .offset(skip)
    .limit(take)
    .getRawMany()

  const count = await getRepository(UserHistoryItem)
    .createQueryBuilder('userHistoryItem')
    .select('userHistoryItem.id', 'id')
    .leftJoin('userHistoryItem.owner', 'owner')
    .where('owner.id = :loggedInUserId', { loggedInUserId })
    .getCount()

  return {
    userHistoryItems: cleanUserItemResults(results),
    userHistoryItemsCount: count
  }
}

export const getUserHistoryItemsMetadata = async (loggedInUserId) => {
  const repository = getRepository(UserHistoryItem)

  const results = await repository
    .createQueryBuilder('userHistoryItem')
    .select('userHistoryItem.mediaFileDuration', 'mediaFileDuration')
    .addSelect('userHistoryItem.userPlaybackPosition', 'userPlaybackPosition')
    .addSelect('userHistoryItem.completed', 'completed')
    .addSelect('mediaRef.id', 'mediaRefId')
    .addSelect('episode.id', 'episodeId')
    .leftJoin('userHistoryItem.mediaRef', 'mediaRef')
    .leftJoin('userHistoryItem.episode', 'episode')
    .leftJoinAndSelect('episode.liveItem', 'liveItem')
    .leftJoin('userHistoryItem.owner', 'owner')
    .where('owner.id = :loggedInUserId', { loggedInUserId })
    .orderBy('userHistoryItem.orderChangedDate', 'DESC')
    .getRawMany()

  const cleanMetaResults = (results) => {
    const cleanedResults = [] as any[]
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const { completed, episodeId, mediaRefId } = result
      const cleanedResult = {
        mediaFileDuration: result.mediaFileDuration,
        userPlaybackPosition: result.userPlaybackPosition,
        ...(completed ? { completed } : {}),
        ...(mediaRefId ? { mediaRefId: mediaRefId } : {}),
        ...(!mediaRefId ? { episodeId: episodeId } : {})
      }
      cleanedResults.push(cleanedResult)
    }
    return cleanedResults
  }

  return cleanMetaResults(results)
}

export const getUserHistoryItemsMetadataMini = async (loggedInUserId) => {
  const repository = getRepository(UserHistoryItem)

  const results = await repository
    .createQueryBuilder('userHistoryItem')
    .select('userHistoryItem.mediaFileDuration', 'd')
    .addSelect('userHistoryItem.userPlaybackPosition', 'p')
    .addSelect('userHistoryItem.completed', 'c')
    .addSelect('mediaRef.id', 'm')
    .addSelect('episode.id', 'e')
    .leftJoin('userHistoryItem.mediaRef', 'mediaRef')
    .leftJoin('userHistoryItem.episode', 'episode')
    .leftJoinAndSelect('episode.liveItem', 'liveItem')
    .leftJoin('userHistoryItem.owner', 'owner')
    .where('owner.id = :loggedInUserId', { loggedInUserId })
    .orderBy('userHistoryItem.orderChangedDate', 'DESC')
    .getRawMany()

  const cleanMetaMiniResults = (results) => {
    const cleanedResults = [] as any[]
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const { c, e, m } = result
      const cleanedResult = {
        d: result.d,
        p: result.p,
        ...(c ? { c } : {}),
        ...(m ? { m } : {}),
        ...(!m ? { e } : {})
      }
      cleanedResults.push(cleanedResult)
    }
    return cleanedResults
  }

  return cleanMetaMiniResults(results)
}

export const addOrUpdateAllHistoryItemsForPodcast = async (loggedInUserId, podcastId) => {
  const episodeRepository = getRepository(Episode)
  const episodeIdsAndDurations = await episodeRepository
    .createQueryBuilder('episode')
    .select('episode.id', 'id')
    .addSelect('episode.duration', 'duration')
    .where('"podcastId" = :podcastId', { podcastId })
    .getRawMany()

  const episodeIdToDurationMap = new Map()
  episodeIdsAndDurations.forEach((item) => episodeIdToDurationMap.set(item.id, item.duration))
  const episodeIds = Array.from(episodeIdToDurationMap.keys())

  const historyItemRepository = getRepository(UserHistoryItem)
  const historyItems = await historyItemRepository
    .createQueryBuilder('userHistoryItem')
    .select('userHistoryItem.id', 'id')
    .addSelect('userHistoryItem.completed', 'completed')
    .addSelect('userHistoryItem.mediaFileDuration', 'mediaFileDuration')
    .addSelect('userHistoryItem.orderChangedDate', 'orderChangedDate')
    .addSelect('userHistoryItem.userPlaybackPosition', 'userPlaybackPosition')
    .addSelect('episode.id', 'episodeId')
    .addSelect('owner.id', 'ownerId')
    .leftJoin('userHistoryItem.owner', 'owner')
    .leftJoin('userHistoryItem.episode', 'episode')
    .where('owner.id = :loggedInUserId', { loggedInUserId })
    .andWhere('userHistoryItem.episodeId IN (:...episodeIds)', { episodeIds })
    .getRawMany()

  for (const userHistoryItem of historyItems) {
    userHistoryItem.completed = true
    await historyItemRepository.save(userHistoryItem)
    episodeIdToDurationMap.delete(userHistoryItem.episodeId)
  }

  for (const item of episodeIdToDurationMap.entries()) {
    const episodeId = item[0]
    const userHistoryItem = new UserHistoryItem()
    userHistoryItem.completed = true
    userHistoryItem.episode = episodeId
    userHistoryItem.owner = loggedInUserId
    userHistoryItem.orderChangedDate = new Date()

    await historyItemRepository.save(userHistoryItem)
  }
}

export const addOrUpdateMultipleUserHistoryItems = async (loggedInUserId, episodeIds) => {
  const historyItemRepository = getRepository(UserHistoryItem)
  const historyItems = await historyItemRepository
    .createQueryBuilder('userHistoryItem')
    .select('userHistoryItem.id', 'id')
    .addSelect('userHistoryItem.completed', 'completed')
    .addSelect('userHistoryItem.mediaFileDuration', 'mediaFileDuration')
    .addSelect('userHistoryItem.orderChangedDate', 'orderChangedDate')
    .addSelect('userHistoryItem.userPlaybackPosition', 'userPlaybackPosition')
    .addSelect('episode.id', 'episodeId')
    .addSelect('owner.id', 'ownerId')
    .leftJoin('userHistoryItem.owner', 'owner')
    .leftJoin('userHistoryItem.episode', 'episode')
    .where('owner.id = :loggedInUserId', { loggedInUserId })
    .andWhere('userHistoryItem.episodeId IN (:...episodeIds)', { episodeIds })
    .getRawMany()

  for (const userHistoryItem of historyItems) {
    userHistoryItem.completed = true
    await historyItemRepository.save(userHistoryItem)
    episodeIds = episodeIds.filter((id) => id !== userHistoryItem.episodeId)
  }

  for (const episodeId of episodeIds) {
    const userHistoryItem = new UserHistoryItem()
    userHistoryItem.completed = true
    userHistoryItem.episode = episodeId
    userHistoryItem.owner = loggedInUserId
    userHistoryItem.orderChangedDate = new Date()

    await historyItemRepository.save(userHistoryItem)
  }
}

export const addOrUpdateHistoryItem = async (loggedInUserId, query) => {
  if (!query['episodeId'] && !query['mediaRefId']) {
    throw new createError.NotFound('An episodeId or mediaRefId must be provided.')
  }

  if (query['episodeId'] && query['mediaRefId']) {
    throw new createError.NotFound(
      'Either an episodeId or mediaRefId must be provided, but not both. Set null for the value that should not be included.'
    )
  }

  if (!query['userPlaybackPosition'] && query['userPlaybackPosition'] !== 0) {
    throw new createError.NotFound('A userPlaybackPosition must be provided.')
  }

  await addOrUpdateDBHistoryItem(loggedInUserId, query)
}

const addOrUpdateDBHistoryItem = async (loggedInUserId, props) => {
  const { completed, episodeId, forceUpdateOrderDate, liveItem, mediaFileDuration, mediaRefId, userPlaybackPosition } =
    props

  const repository = getRepository(UserHistoryItem)

  let userHistoryItem
  if (mediaRefId) {
    userHistoryItem = await repository
      .createQueryBuilder('userHistoryItem')
      .select('userHistoryItem.id', 'id')
      .addSelect('userHistoryItem.completed', 'completed')
      .addSelect('userHistoryItem.mediaFileDuration', 'mediaFileDuration')
      .addSelect('userHistoryItem.userPlaybackPosition', 'userPlaybackPosition')
      .leftJoin('userHistoryItem.mediaRef', 'mediaRef')
      .leftJoin('userHistoryItem.owner', 'owner')
      .where('owner.id = :loggedInUserId', { loggedInUserId })
      .andWhere('mediaRef.id = :mediaRefId', { mediaRefId })
      .getRawOne()
  } else {
    userHistoryItem = await repository
      .createQueryBuilder('userHistoryItem')
      .select('userHistoryItem.id', 'id')
      .addSelect('userHistoryItem.completed', 'completed')
      .addSelect('userHistoryItem.mediaFileDuration', 'mediaFileDuration')
      .addSelect('userHistoryItem.userPlaybackPosition', 'userPlaybackPosition')
      .leftJoin('userHistoryItem.episode', 'episode')
      .leftJoinAndSelect('episode.liveItem', 'liveItem')
      .leftJoin('userHistoryItem.mediaRef', 'mediaRef')
      .leftJoin('userHistoryItem.owner', 'owner')
      .where('owner.id = :loggedInUserId', { loggedInUserId })
      .andWhere('episode.id = :episodeId', { episodeId })
      .andWhere('mediaRef.id IS NULL')
      .getRawOne()
  }

  userHistoryItem = userHistoryItem ? userHistoryItem : new UserHistoryItem()
  if (mediaFileDuration && !liveItem) userHistoryItem.mediaFileDuration = mediaFileDuration

  if (liveItem) {
    userHistoryItem.userPlaybackPosition = 0
  } else {
    userHistoryItem.userPlaybackPosition = userPlaybackPosition
  }

  if (completed === true || completed === false) {
    userHistoryItem.completed = completed
  }

  userHistoryItem.episode = episodeId || null
  userHistoryItem.mediaRef = mediaRefId || null
  userHistoryItem.owner = loggedInUserId
  userHistoryItem.orderChangedDate =
    forceUpdateOrderDate || !userHistoryItem.orderChangedDate ? new Date() : userHistoryItem.orderChangedDate

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
    .orderBy('userHistoryItem.orderChangedDate', 'DESC')
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
    .orderBy('userHistoryItem.orderChangedDate', 'DESC')
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
