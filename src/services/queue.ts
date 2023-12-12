import { FeedUrl, Podcast } from 'podverse-orm'
import { getRepository } from 'typeorm'
import { config } from '~/config'
import { connectToDb } from '~/lib/db'

const { awsConfig } = config
const queueUrls = awsConfig.queueUrls

export const addAllOrphanFeedUrlsToPriorityQueue = async () => {
  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const feedUrls = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .leftJoin('feedUrl.podcast', 'podcast')
      .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NULL')
      .getMany()

    const forceReparsing = false
    const cacheBust = false
    await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.priorityQueueUrl, forceReparsing, cacheBust)
  } catch (error) {
    console.log('queue:addAllOrphanFeedUrlsToPriorityQueue', error)
  }
}

export const addAllPublicFeedUrlsToQueue = async (offset: number) => {
  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const recursivelySendFeedUrls = async (i: number) => {
      console.log('parsing:', i * 1000)

      const feedUrls = await feedUrlRepo
        .createQueryBuilder('feedUrl')
        .select('feedUrl.id')
        .addSelect('feedUrl.url')
        .innerJoinAndSelect('feedUrl.podcast', 'podcast', 'podcast.isPublic = :isPublic', { isPublic: true })
        .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NOT NULL')
        .offset(i * 1000)
        .limit(1000)
        .getMany()

      const forceReparsing = true
      const cacheBust = false
      await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.queueUrl, forceReparsing, cacheBust)

      if (feedUrls.length === 1000) {
        recursivelySendFeedUrls(i + 1)
      }
    }

    await recursivelySendFeedUrls(offset)
  } catch (error) {
    console.log('queue:addAllUntitledPodcastFeedUrlsToQueue', error)
  }
}

export const addFeedsToQueueByPriority = async (parsingPriority: number, offset = 0) => {
  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const recursivelySendFeedUrls = async (i: number) => {
      console.log('parsing:', i * 1000)

      const feedUrls = await feedUrlRepo
        .createQueryBuilder('feedUrl')
        .select('feedUrl.id')
        .addSelect('feedUrl.url')
        .innerJoinAndSelect(
          'feedUrl.podcast',
          'podcast',
          'podcast.isPublic = :isPublic AND podcast."parsingPriority" >= :parsingPriority',
          { isPublic: true, parsingPriority }
        )
        .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NOT NULL')
        .offset(i * 1000)
        .limit(1000)
        .getMany()

      const forceReparsing = true
      const cacheBust = false
      await sendFeedUrlsToQueue(feedUrls, queueUrls.selfManagedFeedsToParse.queueUrl, forceReparsing, cacheBust)

      if (feedUrls.length === 1000) {
        recursivelySendFeedUrls(i + 1)
      }
    }

    await recursivelySendFeedUrls(offset)
  } catch (error) {
    console.log('queue:addAllUntitledPodcastFeedUrlsToQueue', error)
  }
}

export const addAllUntitledPodcastFeedUrlsToQueue = async () => {
  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const feedUrlsCount = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .innerJoinAndSelect('feedUrl.podcast', 'podcast', 'podcast.title IS NULL')
      .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NOT NULL')
      .getCount()

    const ceilCount = Math.ceil(feedUrlsCount / 10000)
    console.log('ceilCount', ceilCount)

    for (let i = 1; i <= ceilCount; i++) {
      console.log('index', i)
      const feedUrls = await feedUrlRepo
        .createQueryBuilder('feedUrl')
        .select('feedUrl.id')
        .addSelect('feedUrl.url')
        .innerJoinAndSelect('feedUrl.podcast', 'podcast', 'podcast.title IS NULL')
        .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NOT NULL')
        .offset(i * 10000)
        .limit(10000)
        .getMany()

      const forceReparsing = true
      const cacheBust = false
      await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.queueUrl, forceReparsing, cacheBust)
    }
  } catch (error) {
    console.log('queue:addAllUntitledPodcastFeedUrlsToQueue', error)
  }
}

export const addFeedUrlsByFeedIdToQueue = async (feedUrlIds) => {
  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const feedUrls = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .leftJoinAndSelect('feedUrl.podcast', 'podcast')
      .where('feedUrl.isAuthority = true AND feedUrl.id IN (:...feedUrlIds)', { feedUrlIds })
      .getMany()

    console.log('Total feedUrls found:', feedUrls.length)

    const forceReparsing = false
    const cacheBust = false
    await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.queueUrl, forceReparsing, cacheBust)
  } catch (error) {
    console.log('queue:addFeedUrlsByFeedIdToQueue', error)
  }
}

export const addFeedUrlsByPodcastIndexId = async (podcastIndexIds: string[], queueType = 'priority') => {
  try {
    console.log('addFeedUrlsByPodcastIndexId podcastIndexIds.length', podcastIndexIds.length)
    console.log('addFeedUrlsByPodcastIndexId queueType', queueType)
    if (!podcastIndexIds || podcastIndexIds.length === 0) {
      throw new Error('No podcastIndexIds provided.')
    }

    // Call connectToDb prior to calling addFeedUrlsByPodcastIndexId
    const feedUrlRepo = getRepository(FeedUrl)

    const feedUrls = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .leftJoinAndSelect('feedUrl.podcast', 'podcast')
      .where('feedUrl.isAuthority = true AND podcast.podcastIndexId IN (:...podcastIndexIds)', { podcastIndexIds })
      .getMany()

    console.log('Total feedUrls found:', feedUrls.length)

    const queueUrl =
      queueType === 'live' ? queueUrls.feedsToParse.liveQueueUrl : queueUrls.feedsToParse.priorityQueueUrl

    const forceReparsing = queueType === 'live'
    const cacheBust = queueType === 'live'
    await sendFeedUrlsToQueue(feedUrls, queueUrl, forceReparsing, cacheBust)

    const podcasts: Podcast[] = []
    const newLastFoundInPodcastIndex = new Date()
    for (const feedUrl of feedUrls) {
      feedUrl.podcast.lastFoundInPodcastIndex = newLastFoundInPodcastIndex
      podcasts.push(feedUrl.podcast)
    }
    const podcastRepo = getRepository(Podcast)
    await podcastRepo.save(podcasts)
  } catch (error) {
    console.log('queue:addFeedUrlsByPodcastIndexId', error)
  }
}

export const addNonPodcastIndexFeedUrlsToPriorityQueue = async () => {
  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const feedUrls = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .leftJoinAndSelect('feedUrl.podcast', 'podcast')
      .where(`feedUrl.isAuthority = true AND coalesce(TRIM(podcast.podcastIndexId), '') = ''`)
      .getMany()

    console.log('Total feedUrls found:', feedUrls.length)

    const forceReparsing = false
    const cacheBust = false
    await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.priorityQueueUrl, forceReparsing, cacheBust)
  } catch (error) {
    console.log('queue:addNonPodcastIndexFeedUrlsToPriorityQueue', error)
  }
}
