import { createConnection, ConnectionOptions } from 'typeorm'
import { config } from '~/config'
import { AccountClaimToken, AppStorePurchase, Author, BitPayInvoice, Category,
  Episode, FeedUrl, GooglePlayPurchase,  MediaRef, PayPalOrder, Playlist,
  Podcast, RecentCategoryEpisodes, User } from '~/entities'

const entities = [
  AccountClaimToken,
  AppStorePurchase,
  Author,
  BitPayInvoice,
  Category,
  Episode,
  FeedUrl,
  GooglePlayPurchase,
  MediaRef,
  PayPalOrder,
  Playlist,
  Podcast,
  RecentCategoryEpisodes,
  User
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
  return createConnection(connectionOptions)
    .then(connection => connection)
    .catch(error => console.error(error))
}
