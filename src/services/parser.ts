import * as parsePodcast from 'node-podcast-parser'
import * as request from 'request-promise-native'
import { getRepository, In } from 'typeorm'
import { config } from '~/config'
import { getPodcast } from '~/controllers/podcast'
import { Author, Category, Episode, FeedUrl, Podcast } from '~/entities'
import { cleanFileExtension, convertToSlug, isValidDate } from '~/lib/utility'
import { deleteMessage, receiveMessageFromQueue, sendMessageToQueue } from '~/services/queue'
import { getFeedUrls } from '~/controllers/feedUrl'
import { shrinkImage } from './imageShrinker'

// import { performance } from 'perf_hooks'

const { awsConfig, userAgent } = config
const queueUrls = awsConfig.queueUrls

export const parseFeedUrl = async (feedUrl, forceReparsing = false) => {
  // console.log('start parsing', performance.now(), feedUrl.url)
  const response = await request(feedUrl.url, {
    timeout: 10000,
    headers: {
      'User-Agent': userAgent
    }
  })

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
        if (!forceReparsing && podcast.feedLastUpdated && data.updated && new Date(podcast.feedLastUpdated) >= new Date(data.updated)) {
          resolve()
          return
        }

        podcast.isPublic = true

        let authors = []

        // console.log('authors', performance.now())
        if (data.author && data.author.length > 0) {
          authors = await findOrGenerateAuthors(data.author) as never
          // console.log('generated authors', performance.now())
        }

        let categories: Category[] = []
        // console.log('categories', performance.now())
        if (data.categories && data.categories.length > 0) {
          categories = await findCategories(data.categories)
          // console.log('generated categories', performance.now())
        }

        // console.log('authors save start', performance.now())
        const authorRepo = getRepository(Author)
        await authorRepo.save(authors)
        // console.log('authors save end', performance.now())
        podcast.authors = authors

        // console.log('categories save start', performance.now())
        const categoryRepo = getRepository(Category)
        await categoryRepo.save(categories)
        // console.log('categories save end', performance.now())
        podcast.categories = categories

        // if parsing an already existing podcast, hide all existing episodes for the podcast,
        // in case they have been removed from the RSS feed.
        // if they still exist, they will be re-added during findOrGenerateParsedEpisodes.
        const episodeRepo = getRepository(Episode)
        if (feedUrl.podcast && feedUrl.podcast.id) {
          await episodeRepo
            .createQueryBuilder()
            .update(Episode)
            .set({ isPublic: false })
            .where({ podcastId: feedUrl.podcast.id })
            .execute()
        }

        // console.log('findOrGenerateParsedEpisodes start', performance.now())
        let newEpisodes = []
        let updatedSavedEpisodes = []

        if (data.episodes && Array.isArray(data.episodes)) {
          const results = await findOrGenerateParsedEpisodes(data.episodes, podcast) as any
          // console.log('findOrGenerateParsedEpisodes end', performance.now())

          newEpisodes = results.newEpisodes
          updatedSavedEpisodes = results.updatedSavedEpisodes
          newEpisodes = newEpisodes && newEpisodes.length > 0 ? newEpisodes : []
          updatedSavedEpisodes = updatedSavedEpisodes && updatedSavedEpisodes.length > 0 ? updatedSavedEpisodes : []

          const latestNewEpisode = newEpisodes.reduce((r: any, a: any) => {
            return r.pubDate > a.pubDate ? r : a
          }, [])
          const latestUpdatedSavedEpisode = updatedSavedEpisodes.reduce((r: any, a: any) => {
            return r.pubDate > a.pubDate ? r : a
          }, [])
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
        podcast.language = data.language
        podcast.linkUrl = data.link
        podcast.sortableTitle = data.title ? data.title.toLowerCase().replace(/\b^the\b|\b^a\b|\b^an\b/i, '').trim() : ''
        podcast.sortableTitle = podcast.sortableTitle ? podcast.sortableTitle.replace(/#/g, '') : ''
        podcast.title = data.title
        podcast.type = data.type

        delete podcast.createdAt
        delete podcast.updatedAt
        delete podcast.episodes
        console.log('jesus', podcast.imageUrl)
        // console.log('podcast save start', performance.now())
        const podcastRepo = getRepository(Podcast)
        await podcastRepo.save(podcast)
        // console.log('podcast save end', performance.now())

        // console.log('podcast image shrink start', performance.now())
        console.log('um', podcast.imageUrl)
        if (podcast && podcast.imageUrl) {
          console.log('what')
          const shrunkImageUrl = await shrinkImage(podcast)
          if (shrunkImageUrl) {
            podcast.shrunkImageUrl = shrunkImageUrl
            await podcastRepo.save(podcast)
          }
        }
        // console.log('podcast image shrink end', performance.now())

        // console.log('updatedSavedEpisodes save start', performance.now())
        await episodeRepo.save(updatedSavedEpisodes, { chunk: 400 })
        // console.log('updatedSavedEpisodes save end', performance.now())

        // console.log('newEpisodes save start', performance.now())
        await episodeRepo.save(newEpisodes, { chunk: 400 })
        // console.log('newEpisodes save end', performance.now())

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
        console.log('error parseFeedUrl, feedUrl:', feedUrl.id, feedUrl.url)
        console.log(error)
      }
    })
  })
}

export const parseFeedUrlsByPodcastIds = async (podcastIds: string[]) => {
  const feedUrls = await getFeedUrls({ podcastId: podcastIds })
  const forceReparsing = true

  for (const feedUrl of feedUrls) {
    await parseFeedUrl(feedUrl, forceReparsing)
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
        console.log('error parsePublicFeedUrls parseFeedUrl', feedUrl.id, feedUrl.url)
        console.log('error', error)
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
        console.log('error parseOrphanFeedUrls parseFeedUrl', feedUrl.id, feedUrl.url)
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
    const feedUrl = await feedUrlRepo
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
    const attrs = generateFeedMessageAttributes(feedUrlMsg)
    await sendMessageToQueue(attrs, errorsQueueUrl)
  }

  await deleteMessage(feedUrlMsg.receiptHandle)

  return true
}

const findOrGenerateAuthors = async (authorNames) => {
  const authorRepo = getRepository(Author)
  const authorNamesArray = authorNames.split(',')
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
  podcast.linkUrl = parsedEpisode.link
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
  // console.log('find savedEpisodes start', performance.now())
  let savedEpisodes = [] as any
  if (parsedEpisodeMediaUrls && parsedEpisodeMediaUrls.length > 0) {
    savedEpisodes = await episodeRepo.find({
      where: {
        mediaUrl: In(parsedEpisodeMediaUrls)
      }
    })
  }

  // console.log('find savedEpisodes end', performance.now())

  // console.log('set all savedEpisodes to isPublic false start', performance.now())
  const nonPublicEpisodes = [] as any
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
