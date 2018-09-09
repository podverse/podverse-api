import { getRepository } from 'typeorm'
import { Episode } from 'entities'

const relations = [
  'authors', 'categories', 'mediaRefs', 'podcast'
]

export default {
  Query: {
    episode (obj, { id }, context, info) {
      const repository = getRepository(Episode)
      return repository.findOne({ id }, { relations })
    },
    episodes (obj, args, context, info) {
      const repository = getRepository(Episode)
      return repository.find({ relations })
    }
  }
}
