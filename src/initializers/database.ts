import * as PostgressConnectionStringParser from 'pg-connection-string'
import { createConnection, ConnectionOptions } from 'typeorm'
import { config } from 'config'
import { Author, Category, Episode, FeedUrl, MediaRef, Playlist,
  Podcast, User } from 'entities'
import seedDatabase from 'initializers/seedDatabase'

export const databaseInitializer = async () => {

  const entities = [
    Author,
    Category,
    Episode,
    FeedUrl,
    MediaRef,
    Playlist,
    Podcast,
    User
  ]

  const connectionOptions = PostgressConnectionStringParser.parse(config.databaseUrl)

  const options: ConnectionOptions = {
    type: 'postgres',
    host: connectionOptions.host,
    port: connectionOptions.port,
    username: connectionOptions.user,
    password: connectionOptions.password,
    database: connectionOptions.database,
    synchronize: true,
    logging: false,
    entities,
    extra: {
      ssl: config.dbsslconn // if not development, will use SSL
    }
  }

  const connection = await createConnection(options)
    .then(connection => connection)
    .catch(error => console.log('TypeORM connection error: ', error))

  // if (connection) {
  //   await seedDatabase(connection)
  // }

}
