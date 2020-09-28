import * as parsePodcast from 'node-podcast-parser'
import { getRepository, In } from 'typeorm'
import { config } from '~/config'
import { getPodcast } from '~/controllers/podcast'
import { Author, Category, Episode, FeedUrl, Podcast } from '~/entities'
import { request } from '~/lib/request'
import { _logEnd, _logStart, cleanFileExtension, convertToSlug, isValidDate, logPerformance } from '~/lib/utility'
import { deleteMessage, receiveMessageFromQueue, sendMessageToQueue } from '~/services/queue'
import { getFeedUrls } from '~/controllers/feedUrl'
import { shrinkImage } from './imageShrinker'

const { awsConfig, parserSupportedLanguages } = config
const queueUrls = awsConfig.queueUrls

export const parseFeedUrl = async (feedUrl, forceReparsing = false) => {
  logPerformance('parseFeedUrl', _logStart, 'feedUrl.url ' + feedUrl.url)
  logPerformance('request', _logStart, 'feedUrl.url ' + feedUrl.url)
  const response = await request(feedUrl.url, { method: 'GET' })
  logPerformance('request feedUrl.url', _logEnd, 'feedUrl.url ' + feedUrl.url)

  return new Promise(async (resolve, reject) => {
    logPerformance('parsePodcast', _logStart)
    await parsePodcast(response, async (error, data) => {
      logPerformance('parsePodcast', _logEnd)
      if (error) {
        reject(error)
        return
      }

      try {
        let podcast = new Podcast()
        
        if (feedUrl.podcast) {
          logPerformance('getPodcast', _logStart, 'feedUrl.podcast.id ' + feedUrl.podcast.id)
          const savedPodcast = await getPodcast(feedUrl.podcast.id, false)
          logPerformance('getPodcast', _logEnd, 'feedUrl.podcast.id ' + feedUrl.podcast.id)
          if (!savedPodcast) throw Error('Invalid podcast id provided.')
          podcast = savedPodcast
        }

        // Stop parsing if the feed has not been updated since it was last parsed.
        if (
            !forceReparsing
            && podcast.feedLastUpdated
            && data.updated
            && new Date(podcast.feedLastUpdated) >= new Date(data.updated)
            && !podcast.alwaysFullyParse
        ) {
          console.log('Stop parsing if the feed has not been updated since it was last parsed')
          resolve()
          return
        }

        // Do not parse a feed if it does not use a supported langugage
        if (!data.language) {
          console.log('Stop parsing if no language tag provided.')
          resolve()
          return
        } else {
          const hasSupportedLanguage = parserSupportedLanguages.some((x: string) => {
            const firstLang = data && data.language && data.language.split('-')[0]
            return x && (x.indexOf(firstLang) >= 0)
          })

          if (!hasSupportedLanguage) {
            console.log('Stop parsing if the language tag does not match a supported language tag.')
            resolve()
            return
          }
        }
        
        podcast.language = data.language
        podcast.isPublic = true
        podcast.feedLastParseFailed = false

        let authors = []

        if (data.author && data.author.length > 0) {
          logPerformance('findOrGenerateAuthors', _logStart)
          authors = await findOrGenerateAuthors(data.author) as never
          logPerformance('findOrGenerateAuthors', _logEnd)
        }

        let categories: Category[] = []
        if (data.categories && data.categories.length > 0) {
          logPerformance('findCategories', _logStart)
          categories = await findCategories(data.categories)
          logPerformance('findCategories', _logEnd)
        }

        logPerformance('getRepository Author', _logStart)
        const authorRepo = getRepository(Author)
        logPerformance('getRepository Author', _logEnd)

        logPerformance('save Authors', _logStart)
        await authorRepo.save(authors)
        logPerformance('save Authors', _logEnd)
        podcast.authors = authors

        logPerformance('getRepository Category', _logStart)
        const categoryRepo = getRepository(Category)
        logPerformance('getRepository Category', _logEnd)

        logPerformance('save Categories', _logStart)
        await categoryRepo.save(categories)
        logPerformance('save Categories', _logEnd)

        podcast.categories = categories

        // if parsing an already existing podcast, hide all existing episodes for the podcast,
        // in case they have been removed from the RSS feed.
        // if they still exist, they will be re-added during findOrGenerateParsedEpisodes.
        logPerformance('getRepository Episode', _logStart)
        const episodeRepo = getRepository(Episode)
        logPerformance('getRepository Episode', _logEnd)

        if (feedUrl.podcast && feedUrl.podcast.id) {
          logPerformance('episodeRepo update', _logStart)
          await episodeRepo
            .createQueryBuilder()
            .update(Episode)
            .set({ isPublic: false })
            .where({ podcastId: feedUrl.podcast.id })
            .execute()
          logPerformance('episodeRepo update', _logEnd)
        }

        let newEpisodes = []
        let updatedSavedEpisodes = []

        if (data.episodes && Array.isArray(data.episodes)) {
          logPerformance('findOrGenerateParsedEpisodes', _logStart)
          const results = await findOrGenerateParsedEpisodes(data.episodes, podcast) as any
          logPerformance('findOrGenerateParsedEpisodes', _logEnd)

          newEpisodes = results.newEpisodes
          updatedSavedEpisodes = results.updatedSavedEpisodes
          newEpisodes = newEpisodes && newEpisodes.length > 0 ? newEpisodes : []
          updatedSavedEpisodes = updatedSavedEpisodes && updatedSavedEpisodes.length > 0 ? updatedSavedEpisodes : []

          logPerformance('episode reduce latestNewEpisode', _logStart)
          const latestNewEpisode = newEpisodes.reduce((r: any, a: any) => {
            return r.pubDate > a.pubDate ? r : a
          }, [])
          logPerformance('episode reduce latestNewEpisode', _logEnd)

          logPerformance('episode reduce latestUpdatedSavedEpisode', _logStart)
          const latestUpdatedSavedEpisode = updatedSavedEpisodes.reduce((r: any, a: any) => {
            return r.pubDate > a.pubDate ? r : a
          }, [])
          logPerformance('episode reduce latestUpdatedSavedEpisode', _logEnd)

          const latestEpisode = (!Array.isArray(latestNewEpisode) && latestNewEpisode)
            || (!Array.isArray(latestUpdatedSavedEpisode) && latestUpdatedSavedEpisode) as any

          podcast.lastEpisodePubDate = isValidDate(latestEpisode.pubDate) ? latestEpisode.pubDate : undefined
          podcast.lastEpisodeTitle = latestEpisode.title
        } else {
          podcast.lastEpisodePubDate = undefined
          podcast.lastEpisodeTitle = ''
        }

        if (data.description && data.description.long) {
          podcast.description = data.description.long
        }

        podcast.feedLastUpdated = isValidDate(data.updated) ? data.updated : new Date()

        podcast.imageUrl = data.image
        if (podcast.imageUrl) {
          let cleanedImageUrl = ''
          if (cleanFileExtension(podcast.imageUrl)) {
            cleanedImageUrl = podcast.imageUrl.substring(0, podcast.imageUrl.lastIndexOf('.'))
            cleanedImageUrl = cleanedImageUrl + '.' + cleanFileExtension(podcast.imageUrl)
          } else {
            cleanedImageUrl = podcast.imageUrl
          }
          podcast.imageUrl = cleanedImageUrl
        }

        podcast.isExplicit = !!data.explicit
        podcast.guid = data.guid
        podcast.linkUrl = data.link
        podcast.sortableTitle = data.title ? data.title.toLowerCase().replace(/\b^the\b|\b^a\b|\b^an\b/i, '').trim() : ''
        podcast.sortableTitle = podcast.sortableTitle ? podcast.sortableTitle.replace(/#/g, '') : ''
        podcast.title = data.title
        podcast.type = data.type

        delete podcast.createdAt
        delete podcast.updatedAt
        delete podcast.episodes

        logPerformance('getRepository podcast', _logStart)
        const podcastRepo = getRepository(Podcast)
        logPerformance('getRepository podcast', _logEnd)

        logPerformance('podcast save', _logStart)
        await podcastRepo.save(podcast)
        logPerformance('podcast save', _logEnd)

        await uploadImageToS3AndSaveToDatabase(podcast, podcastRepo)

        logPerformance('save updatedSavedEpisodes', _logStart)
        await episodeRepo.save(updatedSavedEpisodes, { chunk: 400 })
        logPerformance('save updatedSavedEpisodes', _logEnd)

        logPerformance('save newEpisodes', _logStart)
        await episodeRepo.save(newEpisodes, { chunk: 400 })
        logPerformance('save newEpisodes', _logEnd)

        logPerformance('getRepository feedUrl', _logStart)
        const feedUrlRepo = getRepository(FeedUrl)
        logPerformance('getRepository feedUrl', _logEnd)

        const cleanedFeedUrl = {
          id: feedUrl.id,
          url: feedUrl.url,
          podcast
        }

        logPerformance('cleanedFeedUrl update', _logStart)
        await feedUrlRepo.update(feedUrl.id, cleanedFeedUrl)
        logPerformance('cleanedFeedUrl update', _logEnd)

        resolve()
      } catch (error) {
        reject(error)
      }
      logPerformance('parseFeedUrl', _logEnd, 'feedUrl.url = ' + feedUrl.url)
    })
  })
}

const uploadImageToS3AndSaveToDatabase = async (podcast: any, podcastRepo: any) => {
  // Only shrinkImages and upload to server in production
  if (process.env.NODE_ENV === 'production') {
    if (podcast && podcast.imageUrl) {
      logPerformance('shrinkImage', _logStart)
      const shrunkImageUrl = await shrinkImage(podcast)
      logPerformance('shrinkImage', _logEnd)
      if (shrunkImageUrl) {
        podcast.shrunkImageUrl = shrunkImageUrl
        logPerformance('shrunkImageUrl podcast save', _logStart)
        await podcastRepo.save(podcast)
        logPerformance('shrunkImageUrl podcast save', _logEnd)
      }
    }
  }
}

export const parseFeedUrlsByPodcastIds = async (podcastIds: string[]) => {
  const feedUrls = await getFeedUrls({ podcastId: podcastIds })
  const forceReparsing = true

  for (const feedUrl of feedUrls) {
    try {
      await parseFeedUrl(feedUrl, forceReparsing)
    } catch (error) {
      await handlePodcastFeedLastParseFailed(feedUrl, error)
    }
  }

  console.log('parseFeedUrlsByPodcastIds finished')
  return
}

export const parsePublicFeedUrls = async () => {
  const repository = getRepository(FeedUrl)

  const qb = repository
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
      try {
        await parseFeedUrl(feedUrl)
      } catch (error) {
        await handlePodcastFeedLastParseFailed(feedUrl, error)
      }
    }

    return
  } catch (error) {
    console.log('parsePublicFeedUrls error: ', error)
  }
}

export const parseOrphanFeedUrls = async () => {
  const repository = getRepository(FeedUrl)

  const qb = repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NULL')

  try {
    const feedUrls = await qb.getMany()

    for (const feedUrl of feedUrls) {
      try {
        await parseFeedUrl(feedUrl)
      } catch (error) {
        await handlePodcastFeedLastParseFailed(feedUrl, error)
      }
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
    
    setTimeout(() => {
      parseFeedUrlsFromQueue(restartTimeOut)
    }, restartTimeOut)
  }
}

export const parseNextFeedFromQueue = async () => {
  logPerformance('parseNextFeedFromQueue', _logStart)

  const queueUrl = queueUrls.feedsToParse.queueUrl

  logPerformance('parseNextFeedFromQueue > receiveMessageFromQueue', _logStart, 'queueUrl ' + queueUrl)
  const message = await receiveMessageFromQueue(queueUrl)
  logPerformance('parseNextFeedFromQueue > receiveMessageFromQueue', _logEnd, 'queueUrl ' + queueUrl)

  if (!message) {
    return false
  }

  const feedUrlMsg = extractFeedMessage(message)

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    logPerformance('parseNextFeedFromQueue > find feedUrl in db', _logStart, 'queueUrl ' + queueUrl)
    const feedUrl = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .innerJoinAndSelect(
        'feedUrl.podcast',
        'podcast'
      )
      .where('feedUrl.id = :id', { id: feedUrlMsg.id })
      .getOne()
    logPerformance('parseNextFeedFromQueue > find feedUrl in db', _logEnd, 'queueUrl ' + queueUrl)

    if (feedUrl) {
      try {
        await parseFeedUrl(feedUrl)
      } catch (error) {
        console.log('error parseNextFeedFromQueue parseFeedUrl', feedUrl.id, feedUrl.url)
        console.log('error', error)
        throw error
      }
    } else {
      try {
        await parseFeedUrl(feedUrlMsg)
      } catch (error) {
        console.log('parsePublicFeedUrls feedUrlMsg parseFeedUrl', feedUrlMsg)
        console.log('error', error)
        console.log(feedUrlMsg)
        throw error
      }
    }

  } catch (error) {
    console.error('parseNextFeedFromQueue:parseFeed', error)
    logPerformance('parseNextFeedFromQueue > error handling', _logStart)
    await handlePodcastFeedLastParseFailed(feedUrlMsg, error)
    logPerformance('parseNextFeedFromQueue > error handling', _logEnd)
  }

  logPerformance('parseNextFeedFromQueue > deleteMessage', _logStart)
  await deleteMessage(feedUrlMsg.receiptHandle)
  logPerformance('parseNextFeedFromQueue > deleteMessage', _logEnd)

  logPerformance('parseNextFeedFromQueue', _logEnd)

  return true
}

// If a podcast exists for the feedUrl, then set podcast.feedLastParseFailed true,
// else send the failed feedUrl to the dead letter queue.
export const handlePodcastFeedLastParseFailed = async (feedUrlMsg, inheritedError) => {
  console.log('\n\n\n')
  console.log('***** PODCAST PARSING FAILED *****')
  console.log('podcast.title ', feedUrlMsg && feedUrlMsg.podcast && feedUrlMsg.podcast.title)
  console.log('podcast.id    ', feedUrlMsg && feedUrlMsg.podcast && feedUrlMsg.podcast.id)
  console.log('feedUrl.id    ', feedUrlMsg && feedUrlMsg.id)
  console.log('feedUrl.url   ', feedUrlMsg && feedUrlMsg.url)
  console.log(inheritedError && inheritedError.message)
  console.log('\n\n\n')

  if (feedUrlMsg && feedUrlMsg.podcast && feedUrlMsg.podcast.id) {
    try {
      logPerformance('setPodcastFeedLastParseFailed', _logStart)
      const savedPodcast = await getPodcast(feedUrlMsg.podcast.id, false)
      savedPodcast.feedLastParseFailed = true
      const podcastRepo = getRepository(Podcast)
      await podcastRepo.save(savedPodcast)
      logPerformance('setPodcastFeedLastParseFailed', _logEnd)
    } catch (err) {
      console.log('setPodcastFeedLastParseFailed', feedUrlMsg.podcast.id, err)
    }
  } else if (queueUrls.feedsToParse && queueUrls.feedsToParse.errorsQueueUrl) {
    const errorsQueueUrl = queueUrls.feedsToParse.errorsQueueUrl
    const attrs = generateFeedMessageAttributes(feedUrlMsg, inheritedError)
    await sendMessageToQueue(attrs, errorsQueueUrl)
  }
}

const findOrGenerateAuthors = async (authorNames) => {
  const authorRepo = getRepository(Author)
  // Make sure to remove duplicate values to avoid unique slug/name value collisions
  const authorNamesArray = [...new Set(authorNames.split(',').map(x => x.trim()))]
  const allAuthorSlugs = authorNamesArray.map(x => convertToSlug(x))

  let existingAuthors = [] as any
  if (allAuthorSlugs && allAuthorSlugs.length > 0) {
    existingAuthors = await authorRepo.find({
      where: {
        slug: In(allAuthorSlugs)
      }
    })
  }

  const newAuthors = []
  const newAuthorNames = authorNamesArray.filter(x => {
    return !existingAuthors.find(existingAuthor => {
      return existingAuthor.slug === convertToSlug(x)
    })
  })

  for (const name of newAuthorNames) {
    const author = generateAuthor(name) as never
    newAuthors.push(author)
  }

  for (const existingAuthor of existingAuthors) {
    const matchedName = authorNamesArray.find(x => convertToSlug(x) === existingAuthor.slug)
    existingAuthor.name = matchedName
  }

  const allAuthors = existingAuthors.concat(newAuthors)

  return allAuthors
}

const generateAuthor = name => {
  const author = new Author()
  author.name = name
  return author
}

const findCategories = async (categories: string[]) => {
  const c: string[] = []

  for (const category of categories) {
    if (category.indexOf('>') > 0) {
      c.push(category.substr(0, category.indexOf('>')))
    }
    c.push(category)
  }

  const categoryRepo = getRepository(Category)

  let matchedCategories = [] as any
  if (c && c.length > 0) {
    matchedCategories = await categoryRepo.find({
      where: {
        fullPath: In(c)
      }
    })
  }

  return matchedCategories
}

const assignParsedEpisodeData = async (episode, parsedEpisode, podcast) => {
  episode.isPublic = true
  episode.description = parsedEpisode.description
  // episode.duration = parsedEpisode.duration
  //   ? parseInt(parsedEpisode.duration, 10) : 0
  episode.episodeType = parsedEpisode.episodeType
  episode.guid = parsedEpisode.guid
  episode.imageUrl = parsedEpisode.image
  episode.isExplicit = parsedEpisode.explicit
  episode.linkUrl = parsedEpisode.link
  // episode.mediaFilesize = parsedEpisode.enclosure.filesize
  //   ? parseInt(parsedEpisode.enclosure.filesize, 10) : 0
  episode.mediaType = parsedEpisode.enclosure.type
  episode.mediaUrl = parsedEpisode.enclosure.url
  episode.pubDate = isValidDate(parsedEpisode.published) ? parsedEpisode.published : new Date()
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
  logPerformance('findOrGenerateParsedEpisodes > savedEpisodes', _logStart)
  let savedEpisodes = [] as any
  if (parsedEpisodeMediaUrls && parsedEpisodeMediaUrls.length > 0) {
    savedEpisodes = await episodeRepo.find({
      where: {
        mediaUrl: In(parsedEpisodeMediaUrls)
      }
    })
  }
  logPerformance('findOrGenerateParsedEpisodes > savedEpisodes', _logEnd)

  logPerformance('findOrGenerateParsedEpisodes > nonPublicEpisodes', _logStart)
  const nonPublicEpisodes = [] as any
  for (const e of savedEpisodes) {
    e.isPublic = false
    nonPublicEpisodes.push(e)
  }
  logPerformance('findOrGenerateParsedEpisodes > nonPublicEpisodes', _logStart)

  const savedEpisodeMediaUrls = savedEpisodes.map(x => x.mediaUrl)

  // Create an array of only the parsed episodes that do not have a match
  // already saved in the database.
  const newParsedEpisodes = validParsedEpisodes.filter(
    x => !savedEpisodeMediaUrls.includes(x.enclosure.url)
  )

  const updatedSavedEpisodes = [] as any
  const newEpisodes = [] as any
  // If episode is already saved, then merge the matching episode found in
  // the parsed object with what is already saved.
  for (let existingEpisode of savedEpisodes) {
    const parsedEpisode = validParsedEpisodes.find(
      x => x.enclosure.url === existingEpisode.mediaUrl
    )
    existingEpisode = await assignParsedEpisodeData(existingEpisode, parsedEpisode, podcast)

    
    if (!updatedSavedEpisodes.some((x: any) => x.mediaUrl === existingEpisode.mediaUrl)) {
      updatedSavedEpisodes.push(existingEpisode)
    }
  }

  // If episode from the parsed object is new (not already saved),
  // then create a new episode.
  for (const newParsedEpisode of newParsedEpisodes) {
    let episode = new Episode()
    episode = await assignParsedEpisodeData(episode, newParsedEpisode, podcast)

    
    if (!newEpisodes.some((x: any) => x.mediaUrl === episode.mediaUrl)) {
      newEpisodes.push(episode)
    }
  }

  return {
    updatedSavedEpisodes,
    newEpisodes
  }
}

export const generateFeedMessageAttributes = (feedUrl, error = {} as any) => {
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
    } : {}),
    ...(error && error.message ? {
      'errorMessage': {
        DataType: 'String',
        StringValue: error.message
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
