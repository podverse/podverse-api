import { getRepository } from 'typeorm'
import { Episode } from 'entities'

const relations = [
  'authors', 'categories', 'mediaRefs', 'podcast'
]

const getEpisode = (id) => {
  const repository = getRepository(Episode)
  return repository.findOne({ id }, { relations })
}

const getEpisodes = (query) => {
  const repository = getRepository(Episode)

  return repository.find({
    where: {
      ...query
    },
    relations
  })
}

export {
  getEpisode,
  getEpisodes
}
