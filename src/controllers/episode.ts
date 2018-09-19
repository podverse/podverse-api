import { getRepository } from 'typeorm'
import { Episode } from 'entities'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'mediaRefs', 'podcast'
]

const getEpisode = (id) => {
  const repository = getRepository(Episode)
  const episode = repository.findOne({ id }, { relations })

  if (!episode) {
    throw new createError.NotFound('Episode not found')
  }

  return episode
}

const getEpisodes = (query, options) => {
  const repository = getRepository(Episode)

  return repository.find({
    where: {
      ...query
    },
    relations,
    ...options
  })
}

export {
  getEpisode,
  getEpisodes
}
