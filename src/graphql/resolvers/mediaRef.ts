import { getRepository } from 'typeorm'
import { MediaRef } from 'entities/mediaRef'

const relations = [
  'authors', 'categories', 'episode', 'owner', 'podcast'
]

export default {
  Query: {
    mediaRef (obj, { id }, context, info) {
      const repository = getRepository(MediaRef)
      return repository.findOne({ id }, { relations })
    },
    mediaRefs (obj, args, context, info) {
      const repository = getRepository(MediaRef)
      return repository.find({ relations })
    }
  }
}
