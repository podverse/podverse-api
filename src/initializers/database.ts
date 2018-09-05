import { createConnection, ConnectionOptions, getConnection } from 'typeorm'
import { Author } from 'entities/author'
import { Category } from 'entities/category'
import { Episode } from 'entities/episode'
import { FeedUrl } from 'entities/feedUrl'
import { MediaRef } from 'entities/mediaRef'
import { Playlist } from 'entities/playlist'
import { Podcast } from 'entities/podcast'
import { User } from 'entities/user'

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
    logging: ['query', 'error'],
    synchronize: true
  }

  let connection = await createConnection(options)

  let category1 = new Category()
  category1.title = 'Category 1'
  await connection.manager.save(category1)

  let category2 = new Category()
  category2.title = 'Category 2'
  await connection.manager.save(category2)

  let mediaRef1 = new MediaRef()
  mediaRef1.episodeMediaUrl = 'https://podverse.fm'
  mediaRef1.podcastFeedUrl = 'https://podverse.fm'
  mediaRef1.title = 'MediaRef 1'

  mediaRef1.categories = [category1, category2]
  await connection.manager.save(mediaRef1)

  let mediaRef2 = new MediaRef()
  mediaRef2.episodeMediaUrl = 'https://podverse.fm'
  mediaRef2.podcastFeedUrl = 'https://podverse.fm'
  mediaRef2.title = 'MediaRef 2'

  mediaRef2.categories = [category2]
  await connection.manager.save(mediaRef2)

  let category3 = new Category()
  category3.title = 'Category 3'
  category3.categories = [category1, category2]
  await connection.manager.save(category3)

  const mediaRefs = await connection
    .getRepository(Category)
    .find({
      relations: ['categories']
    })

  console.log('yaaay', mediaRefs) 

}
