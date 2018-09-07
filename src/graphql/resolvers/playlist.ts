import { getRepository } from 'typeorm'
import { Playlist } from 'entities/playlist'

const relations = [
  'owner'
]

export default {
  Mutation: {
    async createPlaylist (_, { patch }) {
      const repository = getRepository(Playlist)
      const playlist = new Playlist()
      const newPlaylist = Object.assign(playlist, patch)
      await repository.save(newPlaylist)
      return { ...newPlaylist }
    },
    async deletePlaylist (_, { id }) {
      const repository = getRepository(Playlist)
      const playlist = await repository.findOne({ id })
      await repository.delete(id)
      return { ...playlist }
    },
    async updatePlaylist (_, { id, patch }) {
      const repository = getRepository(Playlist)
      const playlist = await repository.findOne({ id })
      const newPlaylist = Object.assign(playlist, patch)
      await repository.save(newPlaylist)
      return { ...newPlaylist }
    }
  },
  Query: {
    playlist (obj, { id }, context, info) {
      const repository = getRepository(Playlist)
      return repository.findOne({ id }, { relations })
    },
    playlists (obj, args, context, info) {
      const repository = getRepository(Playlist)
      return repository.find({ relations })
    }
  }
}
