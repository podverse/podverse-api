import * as parsePodcast from 'node-podcast-parser'
import * as request from 'request'
import { getRepository } from 'typeorm'
import { Podcast } from 'entities/podcast'
import { databaseInitializer } from 'initializers/database'
import category from 'graphql/resolvers/category';
import { Category } from 'entities/category';

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

      podcast.categories = []
      for (const category of data.categories) {
        let c = new Category()
        console.log(category)
        c.title = category
        podcast.categories.push(c)
      }

      // {
      //   categories: ['Games & Hobbies', 'Comedy', 'Automotive'],
      //     title: 'Car Talk',
      //       link: 'http://www.cartalk.com',
      //         description:
      //   {
      //     long:
      //     'America\'s funniest auto mechanics take calls from weary car owners all over the country, and crack wise while they diagnose Dodges and dismiss Diahatsus. You don\'t have to know anything about cars to love this one hour weekly laugh fest.'
      //   },
      //   language: 'en-us',
      //     author: 'NPR',
      //       owner: { },
      //   image:
      //   'https://media.npr.org/images/podcasts/primary/icon_510208-d265115dff4c0c53bbe2ad8b5201feb26d1fcb03.jpg?s=1400',
      //     type: 'episodic',
      //       episodes:
      //   [{
      //     title: '#1835: The Soul of an Isuzu',
      //     description: 'Car Talk September 1, 2018',
      //     published: 2018 - 09 - 01T12: 00: 00.000Z,
      //     guid: '4124c15f-72ed-4864-99aa-ca3d491ba700',
      //     duration: 3254,
      //     explicit: false,
      //     episodeType: 'full',
      //     enclosure: [Object]
      //   },
      //   {
      //     title: '#1834: Foreign Accent Syndrome',
      //     description: 'Car Talk August 25, 2018',
      //     published: 2018 - 08 - 25T12: 00: 00.000Z,
      //     guid: 'f0f3d482-82f1-4230-af72-9cad78986bb3',
      //     duration: 3250,
      //     explicit: false,
      //     episodeType: 'full',
      //     enclosure: [Object]
      //   }],
      //     updated: 2018 - 09 - 01T12: 00: 00.000Z
      // }

      await repository.save(podcast)

    })
  })
}
