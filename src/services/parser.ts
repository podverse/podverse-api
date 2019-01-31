import * as parsePodcast from 'node-podcast-parser'
import * as request from 'request-promise-native'
import { getRepository, In } from 'typeorm'
import { config } from '~/config'
import { Author, Category, Episode, FeedUrl, Podcast } from '~/entities'
import { deleteMessage, receiveMessageFromQueue, sendMessageToQueue
  } from '~/services/queue'

const { awsConfig } = config
const queueUrls = awsConfig.queueUrls

// Handle try/catch in whatever calls parseFeed
export const parseFeedUrl = async feedUrl => {
  const response = await request(feedUrl.url)

  return new Promise(async (resolve, reject) => {
    await parsePodcast(response, async (error, data) => {
      if (error) {
        console.error('Parsing error', error, feedUrl.url)
        reject()
        return
      }

      const podcastRepo = await getRepository(Podcast)
      let podcast = feedUrl.podcast || new Podcast()
      const isNewPodcast = !!feedUrl.podcast
      podcast.isPublic = true

      let authors = []
      if (data.author) {
        authors = await findOrGenerateAuthors(data.author) as never
      }
      podcast.authors = authors

      let categories = []
      if (data.categories) {
        categories = await findCategories(data.categories)
      }
      podcast.categories = categories

      podcast.episodes = await findOrGenerateParsedEpisodes(data.episodes, podcast)

      const latestEpisode = podcast.episodes.reduce((r, a) => {
        return r.pubDate > a.pubDate ? r : a
      })

      podcast.lastEpisodePubDate = latestEpisode.pubDate
      podcast.lastEpisodeTitle = latestEpisode.title

      if (data.description && data.description.long) {
        podcast.description = data.description.long
      }

      podcast.feedLastUpdated = data.updated
      podcast.imageUrl = data.image
      podcast.isExplicit = data.explicit
      podcast.guid = data.guid
      podcast.language = data.language
      podcast.linkUrl = data.link
      podcast.title = data.title
      podcast.type = data.type

      if (isNewPodcast) {
        await podcastRepo.save(podcast)
      } else {
        await podcastRepo.update(podcast.id, podcast)
      }

      const feedUrlRepo = await getRepository(FeedUrl)

      const cleanedFeedUrl = {
        id: feedUrl.id,
        url: feedUrl.url,
        podcast: podcast.id
      }

      await feedUrlRepo.update(feedUrl.id, cleanedFeedUrl)

      resolve()
    })
  })
}

export const parsePublicFeedUrlsLocally = async () => {
  const repository = getRepository(FeedUrl)

  let qb = repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .leftJoinAndSelect(
      'feedUrl.podcast',
      'podcast',
      'podcast.isPublic = :isPublic',
      {
        isPublic: true
      }
    )
    .leftJoinAndSelect('podcast.episodes', 'episodes')
    .where('feedUrl.isAuthority = true')

  try {
    const feedUrls = await qb.getMany()

    for (const feedUrl of feedUrls) {
      await parseFeedUrl(feedUrl)
    }

    return
  } catch (error) {
    console.log(error)
  }
}

export const parseOrphanFeedUrlsLocally = async () => {
  const repository = getRepository(FeedUrl)

  let qb = repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .leftJoinAndSelect('feedUrl.podcast', 'podcast')
    .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NULL')

  try {
    const feedUrls = await qb.getMany()

    for (const feedUrl of feedUrls) {
      await parseFeedUrl(feedUrl)
    }

    return
  } catch (error) {
    console.log(error)
  }
}

export const parseAllFeedUrlsFromQueue = async priority => {
  const shouldContinue = await parseNextFeedFromQueue(priority)
  if (shouldContinue) {
    await parseAllFeedUrlsFromQueue(priority)
  }
}

export const parseNextFeedFromQueue = async priority => {
  const queueUrl = queueUrls.feedsToParse.priority[priority].queueUrl
  const errorsQueueUrl = queueUrls.feedsToParse.priority[priority].errorsQueueUrl
  const message = await receiveMessageFromQueue(queueUrl)

  if (!message) {
    return false
  }

  const feedUrl = extractFeedMessage(message)

  if (feedUrl && feedUrl.url && feedUrl.podcast.id) {
    try {
      await parseFeedUrl(feedUrl.url)
    } catch (error) {
      console.error('parseNextFeedFromQueue:parseFeed', error)
      const attrs = generateFeedMessageAttributes(feedUrl)
      await sendMessageToQueue(attrs, errorsQueueUrl)
    }

    await deleteMessage(feedUrl.receiptHandle)
  }

  return true
}

const findOrGenerateAuthors = async (authorNames) => {
  const authorRepo = await getRepository(Author)
  let allAuthorNames = authorNames.split(',').map(x => x.trim())

  const existingAuthors = await authorRepo.find({
    where: {
      name: In(allAuthorNames)
    }
  })

  let newAuthors = []
  let existingAuthorNames = existingAuthors.map(x => x.name)
  let newAuthorNames = allAuthorNames.filter(x => !existingAuthorNames.includes(x))

  for (const name of newAuthorNames) {
    let author = generateAuthor(name) as never
    newAuthors.push(author)
  }

  const allAuthors = existingAuthors.concat(newAuthors)

  return allAuthors
}

const generateAuthor = name => {
  let author = new Author()
  author.name = name
  return author
}

const findCategories = async categories => {
  const categoryRepo = await getRepository(Category)
  categories = await categoryRepo.find({
    where: {
      title: In(categories)
    }
  })
  return categories
}

const assignParsedEpisodeData = async (episode, parsedEpisode, podcast) => {
  episode.description = parsedEpisode.description
  episode.duration = parsedEpisode.duration
  episode.episodeType = parsedEpisode.episodeType
  episode.guid = parsedEpisode.guid
  episode.imageUrl = parsedEpisode.image
  episode.isExplicit = parsedEpisode.explicit
  episode.mediaFilesize = parsedEpisode.enclosure.filesize
  episode.mediaType = parsedEpisode.enclosure.type
  episode.mediaUrl = parsedEpisode.enclosure.url
  episode.pubDate = parsedEpisode.published
  episode.title = parsedEpisode.title

  let authors = []
  if (parsedEpisode.author) {
    authors = await findOrGenerateAuthors(parsedEpisode.author) as never[]
  }
  episode.authors = authors

  let categories = []
  if (parsedEpisode.categories) {
    categories = await findCategories(parsedEpisode.categories)
  }
  episode.categories = categories

  episode.podcast = podcast

  return episode
}

const findOrGenerateParsedEpisodes = async (parsedEpisodes, podcast) => {
  const episodeRepo = await getRepository(Episode)

  // Parsed episodes are only valid if they have enclosure tags
  const validParsedEpisodes = parsedEpisodes.reduce((result, x) => {
    if (x.enclosure && x.enclosure.url) {
      result.push(x)
    }
    return result
  }, [])

  const parsedEpisodeMediaUrls = validParsedEpisodes.map(x => x.enclosure.url)

  const savedEpisodes = await episodeRepo.find({
    where: {
      mediaUrl: In(parsedEpisodeMediaUrls)
    }
  })
  const savedEpisodeMediaUrls = savedEpisodes.map(x => x.mediaUrl)

  const newParsedEpisodes = validParsedEpisodes.filter(
    x => !savedEpisodeMediaUrls.includes(x.enclosure.url)
  )

  const allEpisodes = []
  // If episode is already saved, then update the existing episode
  for (let existingEpisode of savedEpisodes) {
    let parsedEpisode = validParsedEpisodes.find(
      x => x.enclosure.url === existingEpisode.mediaUrl
    )
    existingEpisode = await assignParsedEpisodeData(existingEpisode, parsedEpisode, podcast)
    // @ts-ignore
    allEpisodes.push(existingEpisode)
  }

  // If episode is new (not already saved), then create a new episode
  for (const newParsedEpisode of newParsedEpisodes) {
    let episode = new Episode()
    episode = await assignParsedEpisodeData(episode, newParsedEpisode, podcast)
    // @ts-ignore
    allEpisodes.push(episode)
  }

  return allEpisodes
}

export const generateFeedMessageAttributes = feed => {
  return {
    'url': {
      DataType: 'String',
      StringValue: feed.url
    },
    'podcastId': {
      DataType: 'String',
      StringValue: feed.podcast.id
    },
    'podcastTitle': {
      DataType: 'String',
      StringValue: feed.podcast.title
    }
  }
}

const extractFeedMessage = message => {
  const attrs = message.MessageAttributes
  return {
    url: attrs.feedUrl.StringValue,
    podcast: {
      id: attrs.podcastId.StringValue,
      title: attrs
    },
    receiptHandle: message.ReceiptHandle
  }
}
