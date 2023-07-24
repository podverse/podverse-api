import { createConnection, ConnectionOptions } from 'typeorm'
import { config } from '~/config'
import {
  AccountClaimToken,
  AppStorePurchase,
  Author,
  BitPayInvoice,
  Category,
  Episode,
  EpisodeMostRecent,
  FCMDevice,
  FeedUrl,
  GooglePlayPurchase,
  LiveItem,
  MediaRef,
  MediaRefVideos,
  Notification,
  PayPalOrder,
  Playlist,
  Podcast,
  RecentEpisodeByCategory,
  RecentEpisodeByPodcast,
  UPDevice,
  User,
  UserHistoryItem,
  UserNowPlayingItem,
  UserQueueItem
} from '~/entities'
import { loggerInstance } from './logging'

const entities = [
  AccountClaimToken,
  AppStorePurchase,
  Author,
  BitPayInvoice,
  Category,
  Episode,
  EpisodeMostRecent,
  FCMDevice,
  FeedUrl,
  GooglePlayPurchase,
  LiveItem,
  MediaRef,
  MediaRefVideos,
  Notification,
  PayPalOrder,
  Playlist,
  Podcast,
  RecentEpisodeByCategory,
  RecentEpisodeByPodcast,
  UPDevice,
  User,
  UserHistoryItem,
  UserNowPlayingItem,
  UserQueueItem
]

const options = config.dbConfig

const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: options.host,
  port: options.port,
  username: options.username,
  password: options.password,
  database: options.database,
  synchronize: options.shouldSync,
  logging: false,
  entities,
  extra: {
    ssl: options.sslConnection
  }
}

export const connectToDb = () => {
  loggerInstance.debug(`Connecting to the database`)
  return createConnection(connectionOptions)
}
