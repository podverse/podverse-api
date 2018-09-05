import { getRepository } from 'typeorm'
import { Playlist } from 'entities/playlist'

const relations = [
  'owner'
]

export default {
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
