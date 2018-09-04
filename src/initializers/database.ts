import { createConnection } from 'typeorm'
import { MediaRef } from 'entities/mediaRef'
import { validate } from 'class-validator'

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
    mediaRef.title = '      asdf fds       '
    mediaRef.episodeMediaUrl = 'https://blah.com'
    mediaRef.podcastFeedUrl = 'https://blah.com'
    mediaRef.startTime = 100

    validate(mediaRef).then(errors => {
      if (errors.length > 0) {
        console.log('validation failed. errors: ', errors)
      } else {
        console.log('validation succeed')
        return connection.manager
          .save(mediaRef)
          .then(mediaRef => {
            console.log('mediaRef saved')
            console.log(mediaRef)
          })
      }
    })
  })

}
