import { Connection } from 'typeorm'
import { validCategories } from '~/config/categories'
import { connectToDb } from '~/lib/db'
import { logPerformance, _logEnd, _logStart } from '~/lib/utility'
import { generateCategories } from '~/seeds/categories'
import { parseQAFeeds } from '~/seeds/qa/feeds'
import { generateQAUsers } from '~/seeds/qa/users'
import { generateQAMediaRefs } from './mediaRefs'
import { statsQAUpdatePageviews } from './stats'

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

  /* TODO: Playlists */

  /* TODO: Playlists with assigned Episodes and MediaRefs */

  /* TODO: RecentEpisodesByCategory */

  /* TODO: RecentEpisodesByPodcast */

  /* TODO: UserHistoryItems */

  /* TODO: UserNowPlayingItems */

  /* TODO: UserQueueItems */

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
