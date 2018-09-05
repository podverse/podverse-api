import { createConnection, ConnectionOptions, getConnection } from 'typeorm'
import { Author } from 'entities/author'
import { Category } from 'entities/category'
import { Episode } from 'entities/episode'
import { FeedUrl } from 'entities/feedUrl'
import { MediaRef } from 'entities/mediaRef'
import { Playlist } from 'entities/playlist'
import { Podcast } from 'entities/podcast'
import { User } from 'entities/user'
import seedDatabase from 'initializers/seedDatabase'

export const databaseInitializer = async () => {

  const options: ConnectionOptions = {
    type: 'postgres',
    host: '0.0.0.0',
    port: 5432,
    username: 'postgres',
    password: 'mysecretpw',
    database: 'postgres',
    entities: [
      Author,
      Category,
      Episode,
      FeedUrl,
      MediaRef,
      Playlist,
      Podcast,
      User
    ],
    logging: ['error'],
    synchronize: true
  }

  let connection = await createConnection(options)

  await seedDatabase(connection)

}
