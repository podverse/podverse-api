import { getRepository } from 'typeorm'
import { FeedUrl } from '~/entities'
const createError = require('http-errors')

const relations = [
  'podcast'
]

const getFeedUrl = (id) => {
  const repository = getRepository(FeedUrl)
  const feedUrl = repository.findOne({ id }, { relations })

  if (!feedUrl) {
    throw new createError.NotFound('FeedUrl not found')
  }

  return feedUrl
}

const getFeedUrls = (query, options) => {
  const repository = getRepository(FeedUrl)

  return repository.find({
    where: {
      ...query
    },
    relations,
    ...options
  })
}

export {
  getFeedUrl,
  getFeedUrls
}
