import { addOrUpdateQueueItem } from 'podverse-orm'
import { logPerformance, _logEnd, _logStart } from 'podverse-shared'
import { getRandomEpisodeIds } from './episodes'
import { getRandomMediaRefIds } from './mediaRefs'
import { generateQAItemsForUsers } from './utility'

export const generateQAUserQueueItems = async () => {
  logPerformance('generateQAUserQueueItems', _logStart)
  await generateQAItemsForUsers(generateUserQueueItemsForUser)
  logPerformance('generateQAUserQueueItems', _logEnd)
}

const generateUserQueueItemsForUser = async (userId: string) => {
  const episodeIds = await getRandomEpisodeIds()
  const mediaRefIds = await getRandomMediaRefIds()

  for (let i = 0; i < 10; i++) {
    await addOrUpdateQueueItem(userId, {
      episodeId: episodeIds[i],
      mediaRefId: '',
      queuePosition: 0
    })
    await addOrUpdateQueueItem(userId, {
      episodeId: '',
      mediaRefId: mediaRefIds[i],
      queuePosition: 0
    })
  }
}
