import { getRepository, In } from 'typeorm'
import { FeedUrl } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
import { removeProtocol } from '~/lib/utility'
const createError = require('http-errors')

const relations = ['podcast']

const addFeedUrls = async (urls: any[] = []) => {
  const repository = getRepository(FeedUrl)
  const feeds = [] as any

  for (const url of urls) {
    let feedUrl = await repository.findOne({
      where: {
        url
      },
      relations
    })

    if (!feedUrl) {
      feedUrl = new FeedUrl()
      feedUrl.url = url
      feedUrl.isAuthority = true
      await validateClassOrThrow(feedUrl)
      await repository.save(feedUrl)
    }

    if (feedUrl) {
      feeds.push(feedUrl)
    }
  }

  return feeds
}

const deleteFeedUrl = async (id) => {
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

const getFeedUrl = async (id) => {
  const repository = getRepository(FeedUrl)
  const feedUrl = await repository.findOne({ id }, { relations })

  if (!feedUrl) {
    throw new createError.NotFound('FeedUrl not found')
  }

  return feedUrl
}

const getFeedUrlByUrl = async (url) => {
  const repository = getRepository(FeedUrl)

  const feedUrl = await repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .innerJoinAndSelect('feedUrl.podcast', 'podcast')
    .where({ url })
    .getOne()

  if (!feedUrl) {
    throw new createError.NotFound('FeedUrl not found')
  }

  return feedUrl
}

const getFeedUrlByUrlIgnoreProtocolForPublicPodcast = async (url, skipNotFound) => {
  const repository = getRepository(FeedUrl)
  const feedUrlWithoutProtocol = removeProtocol(url)

  const feedUrl = await repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .innerJoinAndSelect('feedUrl.podcast', 'podcast')
    .where('feedUrl.url LIKE :url', { url: `%${feedUrlWithoutProtocol}` })
    .andWhere('podcast.isPublic = TRUE')
    .getOne()

  if (!feedUrl && !skipNotFound) {
    throw new createError.NotFound('FeedUrl not found')
  }

  return feedUrl
}

const getFeedUrls = (query) => {
  const repository = getRepository(FeedUrl)

  if (query.podcastId) {
    query.podcast = In(query.podcastId)
  }

  if (query.url) {
    query.url = In(query.url)
  }

  return repository.find({
    where: {
      ...(query.podcast ? { podcast: query.podcast } : {}),
      ...(query.url ? { url: query.url } : {}),
      ...(query.isAuthority ? { isAuthority: true } : {})
    },
    skip: query.skip,
    take: query.take,
    relations
  })
}

export const getAuthorityFeedUrlByPodcastId = async (podcastId: string): Promise<FeedUrl | null> => {
  const feedUrlRepo = getRepository(FeedUrl)

  const feedUrl = await feedUrlRepo
    .createQueryBuilder('feedUrl')
    .select('feedUrl.url')
    .innerJoin('feedUrl.podcast', 'podcast')
    .where('feedUrl.isAuthority = true AND podcast.id = :podcastId', { podcastId })
    .getOne()

  return feedUrl || null
}

export const getAuthorityFeedUrlByPodcastIndexId = async (podcastIndexId: string, allowNonPublic?: boolean) => {
  const repository = getRepository(FeedUrl)

  const qb = repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .innerJoinAndSelect('feedUrl.podcast', 'podcast')
    .where('podcast."podcastIndexId')
    .where('podcast.podcastIndexId = :podcastIndexId', { podcastIndexId })

  if (!allowNonPublic) {
    qb.andWhere('feedUrl.isAuthority = TRUE')
  }

  const feedUrl = await qb.getOne()

  return feedUrl
}

const getFeedUrlsByPodcastIndexIds = async (podcastIndexIds: string[]) => {
  const repository = getRepository(FeedUrl)

  const feedUrl = await repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .innerJoinAndSelect('feedUrl.podcast', 'podcast')
    .where('podcast."podcastIndexId')
    .where('podcast.podcastIndexId IN (:...podcastIndexIds)', { podcastIndexIds })
    .andWhere('feedUrl.isAuthority = TRUE')
    .getMany()

  if (!feedUrl) {
    throw new createError.NotFound('FeedUrls not found')
  }

  return feedUrl
}

const updateFeedUrl = async (obj) => {
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
  getFeedUrlsByPodcastIndexIds,
  getFeedUrlByUrl,
  getFeedUrlByUrlIgnoreProtocolForPublicPodcast,
  getFeedUrls,
  updateFeedUrl
}
