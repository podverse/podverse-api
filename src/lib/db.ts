import { createConnection, ConnectionOptions } from 'typeorm'
import { config } from '~/config'
import { Author, BitPayInvoice, Category, Episode, FeedUrl,
  MediaRef, PayPalOrder, Playlist, Podcast, User } from '~/entities'

const entities = [
  Author,
  BitPayInvoice,
  Category,
  Episode,
  FeedUrl,
  MediaRef,
  PayPalOrder,
  Playlist,
  Podcast,
  User
]

const options = config.dbConfig

export const connectToDb = (workerName?: string) => {

  const connectionOptions: ConnectionOptions = {
    name: `podverse_api${workerName ? `_${workerName}` : ''}`,
    type: 'postgres',
    host: options.host,
    port: options.port,
    username: options.username,
    password: options.password,
    database: options.database,
    synchronize: true,
    logging: false,
    entities,
    extra: {
      ssl: options.sslConnection
    }
  }

  return createConnection(connectionOptions)
    .then(connection => {
      console.log('createConnection:connectionOptions', connectionOptions)
      return connection
    })
    .catch(error => console.error(error))
}
