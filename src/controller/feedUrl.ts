import { getRepository } from 'typeorm'
import { FeedUrl } from 'entities'

const relations = [
  'podcast'
]

const getFeedUrl = (url) => {
  const repository = getRepository(FeedUrl)
  return repository.findOne({ url }, { relations })
}

const getFeedUrls = () => {
  const repository = getRepository(FeedUrl)
  return repository.find({ relations })
}

export default {
  getFeedUrl,
  getFeedUrls
}
