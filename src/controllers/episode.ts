import { getRepository, In } from 'typeorm'
import { Episode } from 'entities'
import { createQueryOrderObject } from 'lib/utility'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'mediaRefs', 'podcast'
]

const getEpisode = (id) => {
  const repository = getRepository(Episode)
  const episode = repository.findOne({
    id,
    isPublic: true
  }, { relations })

  if (!episode) {
    throw new createError.NotFound('Episode not found')
  }

  return episode
}

const getEpisodes = (query) => {
  const repository = getRepository(Episode)

  if (query.podcast && query.podcast.split(',').length > 1) {
    query.podcast = In(query.podcast.split(','))
  }

  const order = createQueryOrderObject(query.sort, 'pubDate')
  delete query.sort

  return repository.find({
    where: {
      ...query,
      isPublic: true
    },
    order,
    relations
  })
}

export {
  getEpisode,
  getEpisodes
}
