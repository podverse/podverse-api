import { getRepository } from 'typeorm'
import { MediaRef } from 'entities/mediaRef'

const relations = [
  'authors', 'categories', 'episode', 'owner', 'podcast'
]

export default {
  Mutation: {
    async createMediaRef (_, { patch }) {
      const repository = getRepository(MediaRef)
      const mediaRef = new MediaRef()
      const newMediaRef = Object.assign(mediaRef, patch)
      await repository.save(newMediaRef)
      return {
        ...newMediaRef
      }
    },
    async updateMediaRef (_, { id, patch }) {
      const repository = getRepository(MediaRef)
      const mediaRef = await repository.findOne({ id })
      const newMediaRef = Object.assign(mediaRef, patch)
      await repository.save(newMediaRef)
      return {
        ...newMediaRef
      }
    }
  },
  Query: {
    async mediaRef (obj, { id }, context, info) {
      const repository = getRepository(MediaRef)
      return repository.findOne({ id }, { relations })
    },
    async mediaRefs (obj, args, context, info) {
      const repository = getRepository(MediaRef)
      return repository.find({ relations })
    }
  }
}
