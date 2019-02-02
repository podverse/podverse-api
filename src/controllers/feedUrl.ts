import { getRepository } from 'typeorm'
import { FeedUrl } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
const createError = require('http-errors')

const relations = [
  'podcast'
]

const addFeedUrls = async (urls: any[] = []) => {
  const repository = getRepository(FeedUrl)

  for (const url of urls) {
    const feedUrl = await repository.findOne({ url })

    if (!feedUrl) {
      const feedUrl = new FeedUrl()
      feedUrl.url = url
      feedUrl.isAuthority = true
      await validateClassOrThrow(feedUrl)
      await repository.save(feedUrl)
    }
  }

  return
}

const deleteFeedUrl = async id => {
  const repository = getRepository(FeedUrl)
  const feedUrl = await repository.findOne({
    where: { id }
  })

  if (!feedUrl) {
    throw new createError.NotFound('FeedUrl not found')
  }

  const result = await repository.remove(feedUrl)
  return result
}

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

const updateFeedUrl = async obj => {
  const repository = getRepository(FeedUrl)
  const feedUrl = await repository.findOne({
    where: {
      id: obj.id
    }
  })

  if (!feedUrl) {
    throw new createError.NotFound('FeedUrl not found')
  }

  const newFeedUrl = Object.assign(feedUrl, obj)
  newFeedUrl.podcast = newFeedUrl.podcastId
  delete newFeedUrl.podcastId

  await validateClassOrThrow(newFeedUrl)

  await repository.save(newFeedUrl)
  return newFeedUrl
}

export {
  addFeedUrls,
  deleteFeedUrl,
  getFeedUrl,
  getFeedUrls,
  updateFeedUrl
}
