import { getRepository } from 'typeorm'
import { User } from 'entities/user'

const relations = ['playlists']

export default {
  Query: {
    user (obj, { id }, context, info) {
      const repository = getRepository(User)
      return repository.findOne({ id }, { relations })
    },
    users (obj, args, context, info) {
      const repository = getRepository(User)
      return repository.find({ relations })
    }
  }
}
