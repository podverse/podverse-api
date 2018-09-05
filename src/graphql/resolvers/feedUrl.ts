import { getRepository } from 'typeorm'
import { FeedUrl } from 'entities/feedUrl'

const relations = [
  'podcast'
]

export default {
  Query: {
    feedUrl (obj, { url }, context, info) {
      const repository = getRepository(FeedUrl)
      return repository.findOne({ url }, { relations })
    },
    feedUrls (obj, args, context, info) {
      const repository = getRepository(FeedUrl)
      return repository.find({ relations })
    }
  }
}
