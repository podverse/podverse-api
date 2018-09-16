import { getRepository } from 'typeorm'
import { FeedUrl } from 'entities'

const relations = [
  'podcast'
]

const getFeedUrl = (url) => {
  const repository = getRepository(FeedUrl)
  return repository.findOne({ url }, { relations })
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
