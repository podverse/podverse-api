import { getRepository } from 'typeorm'
import { MediaRef } from 'entities'

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
      return { ...newMediaRef }
    },
    async deleteMediaRef (_, { id }) {
      const repository = getRepository(MediaRef)
      const mediaRef = await repository.findOne({ id })
      await repository.delete(id)
      return { ...mediaRef }
    },
    async updateMediaRef (_, { id, patch }) {
      const repository = getRepository(MediaRef)
      const mediaRef = await repository.findOne({ id })
      const newMediaRef = Object.assign(mediaRef, patch)
      await repository.save(newMediaRef)
      return { ...newMediaRef }
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
