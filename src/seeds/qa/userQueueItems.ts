import { addOrUpdateQueueItem } from '~/controllers/userQueueItem'
import { logPerformance, _logEnd, _logStart } from '~/lib/utility'
import { getRandomEpisodeIds } from './episodes'
import { getRandomMediaRefIds } from './mediaRefs'
import {
  getQAUserByEmail,
  userFreeTrialExpiredEmail,
  userFreeTrialValidEmail,
  userPremiumExpiredEmail,
  userPremiumValidEmail
} from './users'

export const generateQAUserQueueItems = async () => {
  logPerformance('generateQAUserQueueItems', _logStart)

  const userFreeTrialValid = await getQAUserByEmail(userFreeTrialValidEmail)
  const userFreeTrialExpired = await getQAUserByEmail(userFreeTrialExpiredEmail)
  const userPremiumValid = await getQAUserByEmail(userPremiumValidEmail)
  const userPremiumExpired = await getQAUserByEmail(userPremiumExpiredEmail)

  if (userFreeTrialValid && userFreeTrialExpired && userPremiumValid && userPremiumExpired) {
    await generateUserQueueItemsForUser(userFreeTrialValid.id)
    await generateUserQueueItemsForUser(userFreeTrialExpired.id)
    await generateUserQueueItemsForUser(userPremiumValid.id)
    await generateUserQueueItemsForUser(userPremiumExpired.id)
  }

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
