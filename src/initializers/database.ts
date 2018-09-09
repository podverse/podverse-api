import { createConnection, ConnectionOptions } from 'typeorm'
import { dbConfig } from 'config'
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

  const options: ConnectionOptions = {
    ...dbConfig,
    entities
  }

  let connection = await createConnection(options)

  // await seedDatabase(connection)

}
