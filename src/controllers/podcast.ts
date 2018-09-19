import { getRepository } from 'typeorm'
import { Podcast } from 'entities'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'episodes', 'feedUrls'
]

const getPodcast = (id) => {
  const repository = getRepository(Podcast)
  const podcast = repository.findOne({ id }, { relations })

  if (!podcast) {
    throw new createError.NotFound('Podcast not found')
  }

  return podcast
}

const getPodcasts = (query, options) => {
  const repository = getRepository(Podcast)

  return repository.find({
    where: {
      ...query
    },
    relations,
    ...options
  })
}

export {
  getPodcast,
  getPodcasts
}
