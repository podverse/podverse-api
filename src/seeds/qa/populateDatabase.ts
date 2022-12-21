import { Connection } from 'typeorm'
// import { validCategories } from '~/config/categories'
import { connectToDb } from '~/lib/db'
// import { generateCategories } from '~/seeds/categories'
import { parseQAFeeds } from '~/seeds/qa/feeds'
import { generateQAUsers } from '~/seeds/qa/users'

const populateDatabase = async (connection: Connection): Promise<any> => {
  /* Categories */
  // await generateCategories(connection, validCategories)

  /* Users */
  await generateQAUsers()

  /* 
    FeedUrls
    Podcasts
    Episodes
    LiveItems
    Authors 
  */
  await parseQAFeeds(connection)

  /* TODO: AccountClaimTokens */

  /* TODO: AppStorePurchase */

  /* TODO: FCMDevices */

  /* TODO: GooglePlayPurchases */

  /* TODO: MediaRefs */

  /* TODO: Notifications */

  /* TODO: PayPalOrders */

  /* TODO: Playlists */

  /* TODO: Playlists with assigned Episodes and MediaRefs */

  /* TODO: RecentEpisodesByCategory */

  /* TODO: RecentEpisodesByPodcast */

  /* TODO: UserHistoryItems */

  /* TODO: UserNowPlayingItems */

  /* TODO: UserQueueItems */
}

connectToDb().then(async (connection) => {
  if (connection) {
    await populateDatabase(connection)
  }
})
