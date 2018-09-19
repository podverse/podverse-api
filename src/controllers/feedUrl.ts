import { getRepository } from 'typeorm'
import { FeedUrl } from 'entities'

const relations = [
  'podcast'
]

const getFeedUrl = (id) => {
  const repository = getRepository(FeedUrl)
  return repository.findOne({ id }, { relations })
}

const getFeedUrls = (query) => {
  const repository = getRepository(FeedUrl)

  return repository.find({
    where: {
      ...query
    },
    relations
  })
}

export {
  getFeedUrl,
  getFeedUrls
}
