import { Connection } from 'typeorm'
import {
  podcastIndexIds,
  podcastIndexIdsQuick,
  podcastIndexIdsWithLiveItems,
  podcastIndexIdsWithLiveItemsQuick
} from '~/seeds/qa/podcastIndexIds'
import { addOrUpdatePodcastFromPodcastIndex } from '~/services/podcastIndex'

export const parseQAFeeds = async (connection: Connection, isQuickRun: boolean) => {
  const pIds = isQuickRun ? podcastIndexIdsQuick : podcastIndexIds
  const pIdsLive = isQuickRun ? podcastIndexIdsWithLiveItemsQuick : podcastIndexIdsWithLiveItems
  for (const id of pIds) {
    await addOrUpdatePodcastFromPodcastIndex(connection, id.toString())
  }

  for (const id of pIdsLive) {
    await addOrUpdatePodcastFromPodcastIndex(connection, id.toString())
  }
}
