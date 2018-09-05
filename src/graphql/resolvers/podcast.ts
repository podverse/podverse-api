import { getRepository } from 'typeorm'
import { Podcast } from 'entities/podcast'

const relations = [
  'authors', 'categories', 'episodes', 'feedUrls'
]

export default {
  Query: {
    podcast (obj, { id }, context, info) {
      const repository = getRepository(Podcast)
      return repository.findOne({ id }, { relations })
    },
    podcasts (obj, args, context, info) {
      const repository = getRepository(Podcast)
      return repository.find({ relations })
    }
  }
}
