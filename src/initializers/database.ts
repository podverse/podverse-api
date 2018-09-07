import { createConnection, ConnectionOptions } from 'typeorm'
import { Author } from 'entities/author'
import { Category } from 'entities/category'
import { Episode } from 'entities/episode'
import { FeedUrl } from 'entities/feedUrl'
import { MediaRef } from 'entities/mediaRef'
import { Playlist } from 'entities/playlist'
import { Podcast } from 'entities/podcast'
import { User } from 'entities/user'
import seedDatabase from 'initializers/seedDatabase'

import { dbConfig } from 'config'

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

  const options: ConnectionOptions = {
    ...dbConfig,
    entities
  }

  let connection = await createConnection(options)

  await seedDatabase(connection)

}
