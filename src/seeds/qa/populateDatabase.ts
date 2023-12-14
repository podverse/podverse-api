import { Connection, connectToDb } from 'podverse-orm'
import { validCategories } from '~/config/categories'
import { logPerformance, _logEnd, _logStart } from '~/lib/utility'
import { generateCategories } from '~/seeds/categories'
import { parseQAFeeds } from '~/seeds/qa/feeds'
import { generateQAUsers } from '~/seeds/qa/users'
import { generateQAMediaRefs } from '~/seeds/qa/mediaRefs'
import { generateQAPlaylists } from '~/seeds/qa/playlists'
import { statsQAUpdatePageviews } from '~/seeds/qa/stats'
import { generateQAUserQueueItems } from './userQueueItems'

const populateDatabase = async (connection: Connection, isQuickRun: boolean): Promise<any> => {
  logPerformance('populateDatabase', _logStart)

  /* Categories */
  // This may be unnecessary as the categories are included in the schema-only.sql
  await generateCategories(connection, validCategories)

  /* Users */
  await generateQAUsers()

  /* 
    FeedUrls
    Podcasts
    Episodes
    LiveItems
    Authors 
  */
  await parseQAFeeds(connection, isQuickRun)

  /* TODO: AccountClaimTokens */

  /* TODO: AppStorePurchase */

  /* TODO: FCMDevices */

  /* TODO: GooglePlayPurchases */

  /* MediaRefs */
  await generateQAMediaRefs()

  /* TODO: Notifications */

  /* TODO: PayPalOrders */

  /* Playlists */
  await generateQAPlaylists()

  /* TODO: RecentEpisodesByCategory */

  /* TODO: RecentEpisodesByPodcast */

  /* TODO: UPDevices */

  /* TODO: UserHistoryItems */

  /* TODO: UserNowPlayingItems */

  /* UserQueueItems */
  await generateQAUserQueueItems()

  /* Update pageview stats */
  await statsQAUpdatePageviews()

  logPerformance('populateDatabase', _logEnd)
}

connectToDb().then(async (connection) => {
  if (connection) {
    const isQuickRun = process.argv.length > 2 && process.argv[2] === 'quick'
    await populateDatabase(connection, isQuickRun)
  }
})
