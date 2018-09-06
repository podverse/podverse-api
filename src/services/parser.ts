import * as parsePodcast from 'node-podcast-parser'
import * as request from 'request'
import { getRepository } from 'typeorm'
import { Podcast } from 'entities/podcast'
import { databaseInitializer } from 'initializers/database'

export function parseFeed (url) {

  request(url, (err, res, data) => {
    if (err) {
      console.error('Network error', err)
      return
    }

    parsePodcast(data, async (err, data) => {
      if (err) {
        console.error('Parsing.error', err)
        return
      }

      await databaseInitializer()

      const repository = await getRepository(Podcast)

      let podcast = new Podcast()
      podcast.title = data.title
      await repository.save(podcast)

      console.log(data)
    })
  })
}
