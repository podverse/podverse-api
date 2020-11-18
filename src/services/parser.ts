import { getRepository, In } from 'typeorm'
import { config } from '~/config'
import { updateSoundBites } from '~/controllers/mediaRef'
import { getPodcast } from '~/controllers/podcast'
import { Author, Category, Episode, FeedUrl, Podcast } from '~/entities'
import { _logEnd, _logStart, cleanFileExtension, convertToSlug, isValidDate, logPerformance } from '~/lib/utility'
import { deleteMessage, receiveMessageFromQueue, sendMessageToQueue } from '~/services/queue'
import { getFeedUrls } from '~/controllers/feedUrl'
import { shrinkImage } from './imageShrinker'
const podcastFeedParser = require('@podverse/podcast-feed-parser')
const { awsConfig, userAgent } = config
const queueUrls = awsConfig.queueUrls

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const parseFeedUrl = async (feedUrl, forceReparsing = false) => {
  logPerformance('parseFeedUrl', _logStart, 'feedUrl.url ' + feedUrl.url)

  try {
    const result = await podcastFeedParser.getPodcastFromURL({
      url: feedUrl.url,
      headers: { 'User-Agent': userAgent },
      timeout: 15000
    })
    const { episodes, meta } = result

    let podcast = new Podcast()
    if (feedUrl.podcast) {
      const savedPodcast = await getPodcast(feedUrl.podcast.id, false)
      if (!savedPodcast) throw Error('Invalid podcast id provided.')
      podcast = savedPodcast
    }

    // Stop parsing if the feed has not been updated since it was last parsed.
    if (
      !forceReparsing
      && podcast.feedLastUpdated
      && meta.lastBuildDate
      && new Date(podcast.feedLastUpdated) >= new Date(meta.lastBuildDate)
      && !podcast.alwaysFullyParse
    ) {
      console.log('Stop parsing if the feed has not been updated since it was last parsed')
      return
    }

    let authors = meta.author
    if (authors.length > 0) {
      authors = await findOrGenerateAuthors(authors) as never
    }
    const authorRepo = getRepository(Author)
    await authorRepo.save(authors)
    podcast.authors = authors

    let categories: Category[] = []
    if (meta.categories && meta.categories.length > 0) {
      categories = await findCategories(meta.categories)
    }
    const categoryRepo = getRepository(Category)
    await categoryRepo.save(categories)
    podcast.categories = categories

    podcast.description = meta.description
    podcast.feedLastParseFailed = false

    const feedLastUpdated = new Date(meta.lastBuildDate || meta.pubDate)
    podcast.feedLastUpdated = isValidDate(feedLastUpdated) ? feedLastUpdated : new Date()

    podcast.funding = meta.funding
    podcast.guid = meta.guid
    
    podcast.imageUrl = meta.imageURL
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

    podcast.isExplicit = meta.explicit
    podcast.isPublic = true
    podcast.language = meta.language
    podcast.linkUrl = meta.link

    /*
      Generate the episode data to be saved later,
      and also set podcast fields based on the most recent episode's data.
    */
    let newEpisodes = [] as any
    let updatedSavedEpisodes = [] as any
    if (episodes && Array.isArray(episodes)) {
      const results = await findOrGenerateParsedEpisodes(episodes, podcast) as any

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
      const lastEpisodePubDate = new Date(latestEpisode.pubDate)
      podcast.lastEpisodePubDate = isValidDate(lastEpisodePubDate) ? lastEpisodePubDate : undefined
      podcast.lastEpisodeTitle = latestEpisode.title
    } else {
      podcast.lastEpisodePubDate = undefined
      podcast.lastEpisodeTitle = ''
    }

    podcast.sortableTitle = meta.title ? meta.title.toLowerCase().replace(/\b^the\b|\b^a\b|\b^an\b/i, '').trim() : ''
    podcast.sortableTitle = podcast.sortableTitle ? podcast.sortableTitle.replace(/#/g, '') : ''
    podcast.title = meta.title
    podcast.type = meta.type
    podcast.value = meta.value

    const podcastRepo = getRepository(Podcast)
    await podcastRepo.save(podcast)

    // Limit podcast image PUTs to once per week
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    const wasUpdatedThisWeek = new Date(podcast.feedLastUpdated).getTime() + oneWeek >= new Date(meta.lastBuildDate).getTime()
    if (!wasUpdatedThisWeek || podcast.alwaysFullyParse) {
      await uploadImageToS3AndSaveToDatabase(podcast, podcastRepo)
    }

    const episodeRepo = getRepository(Episode)
    await episodeRepo.save(updatedSavedEpisodes, { chunk: 400 })
    await episodeRepo.save(newEpisodes, { chunk: 400 })

    const feedUrlRepo = getRepository(FeedUrl)
    const cleanedFeedUrl = {
      id: feedUrl.id,
      url: feedUrl.url,
      podcast
    }
    await feedUrlRepo.update(feedUrl.id, cleanedFeedUrl)

    for (const updatedSavedEpisode of updatedSavedEpisodes) {
      const soundBiteArray = updatedSavedEpisode.soundbite
      if (Array.isArray(soundBiteArray) && soundBiteArray.length > 0) {
        await updateSoundBites(updatedSavedEpisode.id, updatedSavedEpisode.soundbite)
      }
    }
    for (const newEpisode of newEpisodes) {
      const soundBiteArray = newEpisode.soundbite
      if (Array.isArray(soundBiteArray) && soundBiteArray.length > 0) {
        await updateSoundBites(newEpisode.id, newEpisode.soundbite)
      }
    }
  } catch (error) {
    throw(error)
  }
}

const uploadImageToS3AndSaveToDatabase = async (podcast: any, podcastRepo: any) => {
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

export const parseFeedUrlsFromQueue = async (queueUrl, restartTimeOut) => {
  const shouldContinue = await parseNextFeedFromQueue(queueUrl)

  if (shouldContinue) {
    await parseFeedUrlsFromQueue(queueUrl, restartTimeOut)
  } else if (restartTimeOut) {
    
    setTimeout(() => {
      parseFeedUrlsFromQueue(queueUrl, restartTimeOut)
    }, restartTimeOut)
  }
}

export const parseNextFeedFromQueue = async (queueUrl: string) => {
  logPerformance('parseNextFeedFromQueue', _logStart)

  logPerformance('parseNextFeedFromQueue > receiveMessageFromQueue', _logStart, 'queueUrl ' + queueUrl)
  const message = await receiveMessageFromQueue(queueUrl)
  logPerformance('parseNextFeedFromQueue > receiveMessageFromQueue', _logEnd, 'queueUrl ' + queueUrl)

  if (!message) {
    return false
  }

  const feedUrlMsg = extractFeedMessage(message)
  let feedUrl

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    logPerformance('parseNextFeedFromQueue > find feedUrl in db', _logStart, 'queueUrl ' + queueUrl)
    feedUrl = await feedUrlRepo
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
    logPerformance('parseNextFeedFromQueue > error handling', _logStart)
    await handlePodcastFeedLastParseFailed(feedUrl || feedUrlMsg, error)
    logPerformance('parseNextFeedFromQueue > error handling', _logEnd)
  }

  logPerformance('parseNextFeedFromQueue > deleteMessage', _logStart)
  await deleteMessage(queueUrl, feedUrlMsg.receiptHandle)
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
  }
  
  if (queueUrls.feedsToParse && queueUrls.feedsToParse.errorsQueueUrl) {
    const errorsQueueUrl = queueUrls.feedsToParse.errorsQueueUrl
    const attrs = generateFeedMessageAttributes(feedUrlMsg, inheritedError)
    await sendMessageToQueue(attrs, errorsQueueUrl)
  }
}


const findOrGenerateAuthors = async (authorNames) => {
  const authorRepo = getRepository(Author)
  // Make sure to remove duplicate values to avoid unique slug/name value collisions
  const authorNamesArray = [...new Set(authorNames.map(x => x.trim()))]
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

  if (parsedEpisode.chapters) {
    episode.chaptersUrl = parsedEpisode.chapters.url
    episode.chaptersType = parsedEpisode.chapters.type
  }
  episode.description = parsedEpisode.description
  episode.duration = parsedEpisode.duration ? parseInt(parsedEpisode.duration, 10) : 0
  episode.episodeType = parsedEpisode.type
  episode.funding = parsedEpisode.funding
  episode.guid = parsedEpisode.guid
  episode.imageUrl = parsedEpisode.image
  episode.isExplicit = parsedEpisode.explicit
  episode.linkUrl = parsedEpisode.link
  // episode.mediaFilesize = parsedEpisode.enclosure.filesize
  //   ? parseInt(parsedEpisode.enclosure.filesize, 10) : 0
  episode.mediaType = parsedEpisode.enclosure.type
  episode.mediaUrl = parsedEpisode.enclosure.url

  const pubDate = new Date(parsedEpisode.pubDate)
  episode.pubDate = isValidDate(pubDate) ? pubDate : new Date()

  episode.soundbite = parsedEpisode.soundbite
  episode.title = parsedEpisode.title
  episode.transcript = parsedEpisode.transcript

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
    if (x.enclosure && x.enclosure.url) result.push(x)
    return result
  }, [])
  // Create an array of only the episode media URLs from the parsed object
  const parsedEpisodeMediaUrls = validParsedEpisodes.map(x => x.enclosure.url)

  // Find episodes in the database that have matching episode media URLs to
  // those found in the parsed object, then store an array of just those URLs.
  let savedEpisodes = [] as any
  if (parsedEpisodeMediaUrls && parsedEpisodeMediaUrls.length > 0) {
    savedEpisodes = await episodeRepo.find({
      where: {
        mediaUrl: In(parsedEpisodeMediaUrls)
      }
    })
  }

  const nonPublicEpisodes = [] as any
  for (const e of savedEpisodes) {
    e.isPublic = false
    nonPublicEpisodes.push(e)
  }

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
    newEpisodes,
    updatedSavedEpisodes
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
