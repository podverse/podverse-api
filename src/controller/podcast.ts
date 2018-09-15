import { getRepository } from 'typeorm'
import { Podcast } from 'entities'

const relations = [
  'authors', 'categories', 'episodes', 'feedUrls'
]

const getPodcast = (id) => {
  const repository = getRepository(Podcast)
  return repository.findOne({ id }, { relations })
}

const getPodcasts = () => {
  const repository = getRepository(Podcast)
  return repository.find({ relations })
}

export default {
  getPodcast,
  getPodcasts
}
