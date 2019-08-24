
import * as parsePodcast from 'node-podcast-parser'
import * as request from 'request-promise-native'
import { getRepository, In, getManager } from 'typeorm'
import { config } from '~/config'
import { Author, Category, Episode, FeedUrl, Podcast } from '~/entities'
import { deleteMessage, receiveMessageFromQueue, sendMessageToQueue } from '~/services/queue'
import { getPodcast } from '~/controllers/podcast'

// import { performance } from 'perf_hooks'

const { awsConfig } = config
const queueUrls = awsConfig.queueUrls


export const parseFeedUrl = async feedUrl => {
  // console.log('start parsing', performance.now(), feedUrl.url)
  const response = await request(feedUrl.url, { timeout: 10000 })
  // console.log('response received', performance.now())
  return new Promise(async (resolve, reject) => {
    await parsePodcast(response, async (error, data) => {
      if (error) {
        console.error('Parsing error', error, feedUrl.url)
        reject()
        return
      }
      // console.log('podcast parsed', performance.now())
      try {
        let podcast = new Podcast()
        if (feedUrl.podcast) {
          // console.log('feedUrl.podcast, getting podcast', performance.now())
          const savedPodcast = await getPodcast(feedUrl.podcast.id)
          // console.log('feedUrl.podcast, done getting podcast', performance.now())
          if (!savedPodcast) throw Error('Invalid podcast id provided.')
          podcast = savedPodcast
        }

        // Stop parsing if the feed has not been updated since it was last parsed.
        if (podcast.feedLastUpdated && data.updated && new Date(podcast.feedLastUpdated) >= new Date(data.updated)) {
          resolve()
          return
        }

        podcast.isPublic = true

        let authors = []
        // console.log('authors', performance.now())
        if (data.author) {
          authors = await findOrGenerateAuthors(data.author) as never
          // console.log('generated authors', performance.now())
        }

        let categories: Category[] = []
        // console.log('categories', performance.now())
        if (data.categories) {
          categories = await findCategories(data.categories)
          // console.log('generated categories', performance.now())
        }

        // console.log('findOrGenerateParsedEpisodes start', performance.now())
        const { newEpisodes, updatedSavedEpisodes } =
          await findOrGenerateParsedEpisodes(data.episodes, podcast) as any
        // console.log('findOrGenerateParsedEpisodes end', performance.now())

        let latestEpisode
        const latestNewEpisode = newEpisodes.reduce((r, a) => {
          return r.pubDate > a.pubDate ? r : a
        }, [])
        const latestUpdatedSavedEpisode = updatedSavedEpisodes.reduce((r, a) => {
          return r.pubDate > a.pubDate ? r : a
        }, [])
        latestEpisode = latestNewEpisode || latestUpdatedSavedEpisode

        podcast.lastEpisodePubDate = latestEpisode.pubDate
        podcast.lastEpisodeTitle = latestEpisode.title

        if (data.description && data.description.long) {
          podcast.description = data.description.long
        }

        podcast.feedLastUpdated = data.updated
        podcast.imageUrl = data.image
        podcast.isExplicit = !!data.explicit
        podcast.guid = data.guid
        podcast.language = data.language
        podcast.linkUrl = data.link
        podcast.sortableTitle = data.title ? data.title.toLowerCase().replace(/\b^the\b|\b^a\b|\b^an\b/i, '').trim() : ''
        podcast.sortableTitle = podcast.sortableTitle ? podcast.sortableTitle.replace(/#/g, '') : ''
        podcast.title = data.title
        podcast.type = data.type

        // console.log('transactionStart', performance.now())
        await getManager().transaction(async transactionalEntityManager => {
          delete podcast.createdAt
          delete podcast.updatedAt
          delete podcast.episodes

          // console.log('transaction authors save start', performance.now())
          await transactionalEntityManager.save(authors)
          // console.log('transaction authors save end', performance.now())

          // console.log('transaction categories save start', performance.now())
          await transactionalEntityManager.save(categories)
          // console.log('transaction categories save end', performance.now())

          podcast.authors = authors
          podcast.categories = categories

          // console.log('transaction podcasts save start', performance.now())
          await transactionalEntityManager.save(podcast)
          // console.log('transaction podcasts save end', performance.now())

          // console.log('transaction save updatedSavedEpisodes start', performance.now())
          await transactionalEntityManager.save(updatedSavedEpisodes, { chunk: 400 })
          // console.log('transaction save updatedSavedEpisodes end', performance.now())

          // console.log('transaction save newEpisodes start', performance.now())
          await transactionalEntityManager.save(newEpisodes, { chunk: 400 })
          // console.log('transaction save newEpisodes end', performance.now())
        })

        const feedUrlRepo = getRepository(FeedUrl)

        const cleanedFeedUrl = {
          id: feedUrl.id,
          url: feedUrl.url,
          podcast
        }

        // console.log('updateFeedUrl start', performance.now())
        await feedUrlRepo.update(feedUrl.id, cleanedFeedUrl)
        // console.log('updateFeedUrl end', performance.now())
        resolve()
      } catch (error) {
        console.log('parseFeedUrl, feedUrl:', feedUrl)
        console.log(error)
      }
    })
  })
}

export const parsePublicFeedUrls = async () => {
  const repository = getRepository(FeedUrl)

  let qb = repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .innerJoinAndSelect(
      'feedUrl.podcast',
      'podcast',
      'podcast.isPublic = :isPublic',
      {
        isPublic: true
      }
    )
    .innerJoinAndSelect('podcast.episodes', 'episodes')
    .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NOT NULL')

  try {
    const feedUrls = await qb.getMany()

    for (const feedUrl of feedUrls) {
      await parseFeedUrl(feedUrl)
    }

    return
  } catch (error) {
    console.log('parsePublicFeedUrls error: ', error)
  }
}

export const parseOrphanFeedUrls = async () => {
  const repository = getRepository(FeedUrl)

  let qb = repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NULL')

  try {
    const feedUrls = await qb.getMany()

    for (const feedUrl of feedUrls) {
      await parseFeedUrl(feedUrl)
    }

    return
  } catch (error) {
    console.log('parseOrphanFeedUrls error: ', error)
  }
}

export const parseFeedUrlsFromQueue = async (restartTimeOut) => {
  const shouldContinue = await parseNextFeedFromQueue()

  if (shouldContinue) {
    await parseFeedUrlsFromQueue(restartTimeOut)
  } else if (restartTimeOut) {
    // @ts-ignore
    setTimeout(() => {
      parseFeedUrlsFromQueue(restartTimeOut)
    }, restartTimeOut)
  }
}

export const parseNextFeedFromQueue = async () => {
  const queueUrl = queueUrls.feedsToParse.queueUrl
  const errorsQueueUrl = queueUrls.feedsToParse.errorsQueueUrl

  // console.log('receiveMessageFromQueue start', performance.now())
  const message = await receiveMessageFromQueue(queueUrl)
  // console.log('receiveMessageFromQueue end', performance.now())

  if (!message) {
    return false
  }

  const feedUrlMsg = extractFeedMessage(message)

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    // console.log('updateFeedUrl start', performance.now())
    let feedUrl = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .innerJoinAndSelect(
        'feedUrl.podcast',
        'podcast'
      )
      .innerJoinAndSelect('podcast.episodes', 'episodes')
      .where('feedUrl.id = :id', { id: feedUrlMsg.id })
      .getOne()
    // console.log('updateFeedUrl end', performance.now())

    if (feedUrl) {
      await parseFeedUrl(feedUrl)
    } else {
      await parseFeedUrl(feedUrlMsg)
    }

  } catch (error) {
    console.error('parseNextFeedFromQueue:parseFeed', error)
    const attrs = generateFeedMessageAttributes(feedUrlMsg)
    await sendMessageToQueue(attrs, errorsQueueUrl)
  }

  await deleteMessage(feedUrlMsg.receiptHandle)

  return true
}

const findOrGenerateAuthors = async (authorNames) => {
  const authorRepo = getRepository(Author)
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

const findCategories = async (categories: string[]) => {
  let c: string[] = []

  for (const category of categories) {
    if (category.indexOf('>') > 0) {
      c.push(category.substr(0, category.indexOf('>')))
    }
    c.push(category)
  }

  const categoryRepo = getRepository(Category)
  const matchedCategories = await categoryRepo.find({
    where: {
      fullPath: In(c)
    }
  })
  return matchedCategories
}

const assignParsedEpisodeData = async (episode, parsedEpisode, podcast) => {
  episode.isPublic = true
  episode.description = parsedEpisode.description
  episode.duration = parsedEpisode.duration
    ? parseInt(parsedEpisode.duration, 10) : 0
  episode.episodeType = parsedEpisode.episodeType
  episode.guid = parsedEpisode.guid
  episode.imageUrl = parsedEpisode.image
  episode.isExplicit = parsedEpisode.explicit
  podcast.linkUrl = parsedEpisode.link
  episode.mediaFilesize = parsedEpisode.enclosure.filesize
    ? parseInt(parsedEpisode.enclosure.filesize, 10) : 0
  episode.mediaType = parsedEpisode.enclosure.type
  episode.mediaUrl = parsedEpisode.enclosure.url
  episode.pubDate = parsedEpisode.published
  episode.title = parsedEpisode.title

  // Since episode authors and categories aren't being used by the app,
  // skip saving this info to the episode.
  // let authors = []
  // if (parsedEpisode.author) {
  //   authors = await findOrGenerateAuthors(parsedEpisode.author) as never[]
  // }
  // episode.authors = authors

  // let categories: Category[] = []
  // if (parsedEpisode.categories) {
  //   categories = await findCategories(parsedEpisode.categories)
  // }
  // episode.categories = categories

  episode.podcast = podcast

  return episode
}

const findOrGenerateParsedEpisodes = async (parsedEpisodes, podcast) => {
  const episodeRepo = getRepository(Episode)

  // Parsed episodes are only valid if they have enclosure.url tags,
  // so ignore all that do not.
  const validParsedEpisodes = parsedEpisodes.reduce((result, x) => {
    if (x.enclosure && x.enclosure.url) {
      result.push(x)
    }
    return result
  }, [])
  // Create an array of only the episode media URLs from the parsed object
  const parsedEpisodeMediaUrls = validParsedEpisodes.map(x => x.enclosure.url)

  // Find episodes in the database that have matching episode media URLs to
  // those found in the parsed object, then store an array of just those URLs.
  // console.log('find savedEpisodes start', performance.now())
  const savedEpisodes = await episodeRepo.find({
    where: {
      mediaUrl: In(parsedEpisodeMediaUrls)
    }
  })
  // console.log('find savedEpisodes end', performance.now())

  // console.log('set all savedEpisodes to isPublic false start', performance.now())
  let nonPublicEpisodes = [] as any
  for (const e of savedEpisodes) {
    e.isPublic = false
    nonPublicEpisodes.push(e)
  }
  // console.log('set all savedEpisodes to isPublic false end', performance.now())

  const savedEpisodeMediaUrls = savedEpisodes.map(x => x.mediaUrl)

  // Create an array of only the parsed episodes that do not have a match
  // already saved in the database.
  const newParsedEpisodes = validParsedEpisodes.filter(
    x => !savedEpisodeMediaUrls.includes(x.enclosure.url)
  )

  const updatedSavedEpisodes = []
  const newEpisodes = []
  // If episode is already saved, then merge the matching episode found in
  // the parsed object with what is already saved.
  for (let existingEpisode of savedEpisodes) {
    let parsedEpisode = validParsedEpisodes.find(
      x => x.enclosure.url === existingEpisode.mediaUrl
    )
    existingEpisode = await assignParsedEpisodeData(existingEpisode, parsedEpisode, podcast)

    // @ts-ignore
    if (!updatedSavedEpisodes.some(x => x.mediaUrl === existingEpisode.mediaUrl)) {
      // @ts-ignore
      updatedSavedEpisodes.push(existingEpisode)
    }
  }

  // If episode from the parsed object is new (not already saved),
  // then create a new episode.
  for (const newParsedEpisode of newParsedEpisodes) {
    let episode = new Episode()
    episode = await assignParsedEpisodeData(episode, newParsedEpisode, podcast)

    // @ts-ignore
    if (!newEpisodes.some(x => x.mediaUrl === episode.mediaUrl)) {
      // @ts-ignore
      newEpisodes.push(episode)
    }
  }

  return {
    updatedSavedEpisodes,
    newEpisodes
  }
}

export const generateFeedMessageAttributes = feedUrl => {
  return {
    'id': {
      DataType: 'String',
      StringValue: feedUrl.id
    },
    'url': {
      DataType: 'String',
      StringValue: feedUrl.url
    },
    ...(feedUrl.podcast && feedUrl.podcast.id ? {
      'podcastId': {
        DataType: 'String',
        StringValue: feedUrl.podcast && feedUrl.podcast.id
      }
    } : {}),
    ...(feedUrl.podcast && feedUrl.podcast.title ? {
      'podcastTitle': {
        DataType: 'String',
        StringValue: feedUrl.podcast && feedUrl.podcast.title
      }
    } : {})
  }
}

const extractFeedMessage = message => {
  const attrs = message.MessageAttributes
  return {
    id: attrs.id.StringValue,
    url: attrs.url.StringValue,
    ...(attrs.podcastId && attrs.podcastTitle ? {
      podcast: {
        id: attrs.podcastId.StringValue,
        title: attrs.podcastTitle.StringValue
      }
    } : {}),
    receiptHandle: message.ReceiptHandle
  } as any
}
