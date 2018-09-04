import { createConnection } from 'typeorm'
import { MediaRef } from 'entities/mediaRef'

export const databaseInitializer = async () => {

  return createConnection({
    type: 'postgres',
    host: '0.0.0.0',
    port: 5432,
    username: 'postgres',
    password: 'mysecretpw',
    database: 'postgres',
    entities: [
      MediaRef
    ],
    logging: ['query', 'error'],
    synchronize: true
  }).then((connection) => {
    console.log('Database connection established')

    const mediaRef = new MediaRef()
    mediaRef.title = 'First mediaRef'
    mediaRef.episodeMediaUrl = 'https://blah.com'
    mediaRef.podcastFeedUrl = 'https://blah.com'
    mediaRef.podcastId = '1234'
    mediaRef.episodeId = '1234'

    return connection.manager
      .save(mediaRef)
      .then(mediaRef => {
        console.log('mediaRef saved')
        console.log(mediaRef)
      })

  })

}
