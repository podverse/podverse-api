import { getRepository } from 'typeorm'
import { Author } from 'entities'

const relations = [
  'episodes', 'mediaRefs', 'podcasts'
]

export default {
  Query: {
    author (obj, { id }, context, info) {
      const repository = getRepository(Author)
      return repository.findOne({ id }, { relations })
    },
    authors (obj, args, context, info) {
      const repository = getRepository(Author)
      return repository.find({ relations })
    }
  }
}
