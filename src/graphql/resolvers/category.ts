import { getRepository } from 'typeorm'
import { Category } from 'entities'

const relations = [
  'category', 'categories', 'episodes', 'mediaRefs', 'podcasts'
]

export default {
  Query: {
    category (obj, { id }, context, info) {
      const repository = getRepository(Category)
      return repository.findOne({ id }, { relations })
    },
    categories (obj, args, context, info) {
      const repository = getRepository(Category)
      return repository.find({ relations })
    }
  }
}
