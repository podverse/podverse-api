import { Connection } from 'typeorm'
import { podcastIndexIds, podcastIndexIdsWithLiveItems } from '~/seeds/qa/podcastIndexIds'
import { addOrUpdatePodcastFromPodcastIndex } from '~/services/podcastIndex'

export const parseQAFeeds = async (connection: Connection) => {
  for (const id of podcastIndexIds) {
    await addOrUpdatePodcastFromPodcastIndex(connection, id.toString())
  }

  for (const id of podcastIndexIdsWithLiveItems) {
    await addOrUpdatePodcastFromPodcastIndex(connection, id.toString())
  }
}
