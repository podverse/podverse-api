import * as parsePodcast from 'node-podcast-parser'
import * as request from 'request'
import { getRepository, In } from 'typeorm'
import { config } from '~/config'
import { connectToDb } from '~/lib/db'
import { Author, Category, Episode, FeedUrl, Podcast } from '~/entities'
import { deleteMessage, receiveMessageFromQueue, sendMessageToQueue }
from '~/services/queue'

const { awsConfig } = config
const feedsToParseUrl = awsConfig.queueUrls.feedsToParse
const feedsToParseErrorsUrl = awsConfig.queueUrls.feedsToParseErrors

export const parseNextFeedFromQueue = async (shouldConnectToDb = false) => {
  if (shouldConnectToDb) {
    await connectToDb()
  }

  const message = await receiveMessageFromQueue(feedsToParseUrl)

  if (!message) {
    return false
  }

  const feed = extractFeedMessage(message)

  if (feed && feed.url && feed.podcast.id) {
    try {
      await parseFeed(feed.url, feed.podcast.id, 'false')
    } catch (error) {
      console.error('parseNextFeedFromQueue:parseFeed', error)
      const attrs = generateFeedMessageAttributes(feed)
      await sendMessageToQueue(attrs, feedsToParseErrorsUrl)
    }

    await deleteMessage(feed.receiptHandle)
  }

  return true
}

export const parseAllFeedsFromQueue = async (shouldConnectToDb = false) => {
  const shouldContinue = await parseNextFeedFromQueue(shouldConnectToDb)
  if (shouldContinue) {
    await parseAllFeedsFromQueue()
  }
}

export const parseFeed = async (url, id, shouldCreate = 'false') => {

  return new Promise((resolve, reject) => {
    request(url, async (error, res, data) => {
      if (error) {
        console.error('Network error', error, { id, url, shouldCreate })
        reject()
        return
      }

      await parsePodcast(data, async (error, data) => {
        if (error) {
          console.error('Parsing error', error, { id, url, shouldCreate })
          reject()
          return
        }

        const podcastRepo = await getRepository(Podcast)

        let podcast
        if (shouldCreate === 'true') {
          const feedUrl = new FeedUrl()
          feedUrl.url = url
          feedUrl.isAuthority = true
          podcast = new Podcast()
          feedUrl.podcast = podcast
          podcast.feedUrls = [feedUrl]
        } else {
          podcast = await podcastRepo.findOne({ id })
          if (!podcast) {
            console.error(
              'Parsing error: No podcast found matching id',
              null,
              { id, url, shouldCreate }
            )
            reject()
            return
          }
        }

        let authors = []
        if (data.author) {
          // @ts-ignore
          authors = await findOrGenerateAuthors(data.author)
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

        await podcastRepo.save(podcast)

        resolve()
      })
    })
  })
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
  const allEpisodeMediaUrls = parsedEpisodes.map(x => x.enclosure.url)

  const existingEpisodes = await episodeRepo.find({
    where: {
      mediaUrl: In(allEpisodeMediaUrls)
    }
  })

  const existingEpisodeMediaUrls = existingEpisodes.map(x => x.mediaUrl)
  const newParsedEpisodes = parsedEpisodes.filter(
    x => !existingEpisodeMediaUrls.includes(x.enclosure.url)
  )

  const allEpisodes = []
  for (let existingEpisode of existingEpisodes) {
    let parsedEpisode = parsedEpisodes.find(
      x => x.enclosure && existingEpisode.mediaUrl
        && x.enclosure.url === existingEpisode.mediaUrl
    )
    existingEpisode = await assignParsedEpisodeData(existingEpisode, parsedEpisode, podcast)
    // @ts-ignore
    allEpisodes.push(existingEpisode)
  }

  for (const newParsedEpisode of newParsedEpisodes) {
    let episode = new Episode()
    episode = await assignParsedEpisodeData(episode, newParsedEpisode, podcast)
    // @ts-ignore
    allEpisodes.push(episode)
  }

  return allEpisodes
}

export const generateFeedMessageAttributes = (feed) => {
  return {
    'feedUrl': {
      DataType: 'String',
      StringValue: feed.url
    },
    'podcastId': {
      DataType: 'String',
      StringValue: feed.podcast.id
    }
  }
}

const extractFeedMessage = (message) => {
  const attrs = message.MessageAttributes
  return {
    url: attrs.feedUrl.StringValue,
    podcast: {
      id: attrs.podcastId.StringValue
    },
    receiptHandle: message.ReceiptHandle
  }
}
