import { getRepository } from 'typeorm'
import { Podcast } from 'entities'

const relations = [
  'authors', 'categories', 'episodes', 'feedUrls'
]

const getPodcast = (id) => {
  const repository = getRepository(Podcast)
  return repository.findOne({ id }, { relations })
}

const getPodcasts = (query) => {
  const repository = getRepository(Podcast)

  return repository.find({
    where: {
      ...query
    },
    relations
  })
}

export {
  getPodcast,
  getPodcasts
}
