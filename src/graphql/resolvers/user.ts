import { getRepository } from 'typeorm'
import { User } from 'entities'

const relations = ['playlists']

export default {
  Mutation: {
    async createUser (_, { patch }) {
      const repository = getRepository(User)
      const user = new User()
      const newUser = Object.assign(user, patch)
      await repository.save(newUser)
      return {
        ...newUser
      }
    },
    async deleteUser (_, { id }) {
      const repository = getRepository(User)
      const user = await repository.findOne({ id })
      await repository.delete(id)
      return { ...user }
    },
    async updateUser (_, { id, patch }) {
      const repository = getRepository(User)
      const user = await repository.findOne({ id })
      const newUser = Object.assign(user, patch)
      await repository.save(newUser)
      return {
        ...newUser
      }
    }
  },
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
