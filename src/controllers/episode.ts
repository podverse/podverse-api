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

const getEpisodes = async (query, includeNSFW) => {
  const repository = getRepository(Episode)

  if (query.podcastId && query.podcastId.split(',').length > 1) {
    query.podcast = In(query.podcastId.split(','))
  } else if (query.podcastId) {
    query.podcast = query.podcastId
  }
  delete query.podcastId

  const order = createQueryOrderObject(query.sort, 'pubDate')
  delete query.sort

  const skip = query.skip
  delete query.skip

  const take = query.take
  delete query.take

  const episodes = await repository.find({
    where: {
      ...query,
      ...query.podcast && {
        podcast: { id: query.podcast }
      },
      ...!includeNSFW && { isExplicit: false },
      isPublic: true
    },
    order,
    skip: parseInt(skip, 10),
    take: parseInt(take, 10),
    relations
  })

  return episodes
}

export {
  getEpisode,
  getEpisodes
}
