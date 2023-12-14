import { Connection, getEpisodesByPodcastIds, getPodcastByPodcastIndexId } from 'podverse-orm'
import { getLightningKeysendValueItem } from 'podverse-shared'
import {
  podcastIndexIds,
  podcastIndexIdsQuick,
  podcastIndexIdsWithLiveItems,
  podcastIndexIdsWithLiveItemsQuick
} from '~/seeds/qa/podcastIndexIds'
import { addOrUpdatePodcastFromPodcastIndex, getPodcastFromPodcastIndexByGuid } from '~/services/podcastIndex'

export const parseQAFeeds = async (connection: Connection, isQuickRun: boolean) => {
  const pIds = isQuickRun ? podcastIndexIdsQuick : podcastIndexIds
  const pIdsLive = isQuickRun ? podcastIndexIdsWithLiveItemsQuick : podcastIndexIdsWithLiveItems
  for (const id of pIds) {
    await addOrUpdatePodcastFromPodcastIndex(connection, id.toString())
  }

  for (const id of pIdsLive) {
    await addOrUpdatePodcastFromPodcastIndex(connection, id.toString())
  }

  /*
    Boostagram Ball is 6524027 and we handle it as a special podcast during the qa script.
    We use it as an example of a feed that has value time splits with remoteItem,
    but remoteItems will only work if we also parse the remote RSS feeds those
    remoteItem tags reference. In order to automatically populate some remoteItem data
    we can use in testing, the seed script will grab the value time splits for
    the latest episode of Boostagram Ball, and parse and save
    each remoteItem's RSS feed as well.
  */
  const boostagramBallPodcastIndexId = 6524027
  const boostagramBall = await getPodcastByPodcastIndexId(boostagramBallPodcastIndexId)
  if (boostagramBall?.id) {
    const boostagramBallEpisodes = await getEpisodesByPodcastIds({ podcastId: boostagramBall.id, sort: 'most-recent' })
    const latestBoostagramBallEpisode = boostagramBallEpisodes?.[0]?.[0]
    if (latestBoostagramBallEpisode) {
      const valueTags = latestBoostagramBallEpisode.value
      if (valueTags && valueTags.length > 0) {
        const lightningKeysendValueItem = getLightningKeysendValueItem(valueTags)
        if (lightningKeysendValueItem) {
          const valueTimeSplits = lightningKeysendValueItem.valueTimeSplits
          if (valueTimeSplits) {
            for (const valueTaggg of valueTimeSplits) {
              try {
                const valueTag: any = valueTaggg
                const podcastIndexPodcast = await getPodcastFromPodcastIndexByGuid(valueTag?.remoteItem?.feedGuid)
                const podcastIndexId = podcastIndexPodcast?.feed?.id
                if (podcastIndexId) {
                  await addOrUpdatePodcastFromPodcastIndex(connection, podcastIndexId)
                }
              } catch (error) {
                // assume a 404
              }
            }
          }
        }
      }
    }
  }
}
