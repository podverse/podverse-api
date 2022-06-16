import nodeFetch from 'node-fetch'
import { parseFeed, Phase4Medium } from 'podcast-partytime'
import type { FeedObject, Episode as EpisodeObject, Phase1Funding, Phase4Value } from 'podcast-partytime'
import {
  addParameterToURL,
  Funding,
  ParsedEpisode,
  parseLatestLiveItemStatus,
  parseLatestLiveItemInfo
} from 'podverse-shared'
import { getRepository, In, Not } from 'typeorm'
import { config } from '~/config'
import { getLiveItemByGuid } from '~/controllers/liveItem'
import { updateSoundBites } from '~/controllers/mediaRef'
import { getPodcast } from '~/controllers/podcast'
import { Author, Category, Episode, FeedUrl, LiveItem, Podcast } from '~/entities'
import type { Value } from '~/entities/podcast'
import { _logEnd, _logStart, convertToSlug, convertToSortableTitle, isValidDate, logPerformance } from '~/lib/utility'
import { deleteMessage, receiveMessageFromQueue, sendMessageToQueue } from '~/services/queue'
import { getFeedUrls, getFeedUrlsByPodcastIndexIds } from '~/controllers/feedUrl'
import { shrinkImage } from './imageShrinker'
import { Phase4PodcastLiveItem } from 'podcast-partytime/dist/parser/phase/phase-4'
import {
  sendLiveItemLiveDetectedNotification,
  sendNewEpisodeDetectedNotification
} from '~/lib/notifications/fcmGoogleApi'
import { getPodcastValueTagForPodcastIndexId } from '~/services/podcastIndex'
const { awsConfig, userAgent } = config
const { queueUrls, s3ImageLimitUpdateDays } = awsConfig

interface ExtendedEpisode extends Episode {
  soundbite: any[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const parseFeedUrl = async (feedUrl, forceReparsing = false, cacheBust = false) => {
  logPerformance('parseFeedUrl', _logStart, 'feedUrl.url ' + feedUrl.url)

  const abortController = new AbortController()
  const abortTimeout = setTimeout(() => {
    abortController.abort()
  }, 180000)

  try {
    const urlToParse = cacheBust ? addParameterToURL(feedUrl.url, `cacheBust=${Date.now()}`) : feedUrl.url
    console.log('*** urlToParse', urlToParse)

    logPerformance('podcastFetchAndParse', _logStart)
    const xml = await nodeFetch(feedUrl.url, {
      headers: { 'User-Agent': userAgent },
      follow: 5,
      size: 40000000,
      signal: abortController.signal
    }).then((resp) => resp.text())
    const parsedFeed = parseFeed(xml, { allowMissingGuid: true })
    logPerformance('podcastFetchAndParse', _logEnd)

    if (!parsedFeed) {
      throw new Error('parseFeedUrl invalid partytime parser response')
    }

    const fundingCompat = (funding: Phase1Funding): Funding => {
      return {
        value: funding.message,
        url: funding.url
      }
    }

    const valueCompat = (val: Phase4Value): Value => {
      return {
        type: val.type,
        method: val.method,
        suggested: val.suggested,
        recipients: val.recipients.map((r) => {
          return {
            name: r.name,
            type: r.type,
            address: r.address,
            split: r.split.toString(),
            fee: r.fee,
            customKey: r.customKey,
            customValue: r.customValue
          }
        })
      }
    }

    // Convert the podcast-partytime schema to a podverse compatible schema.
    const feedCompat = (feed: FeedObject) => {
      return {
        author: Array.isArray(feed.author) ? feed.author : feed.author ? [feed.author] : [],
        blocked: feed.itunesBlock,
        categories: feed.itunesCategory,
        description: feed.description,
        explicit: feed.explicit,
        funding: Array.isArray(feed.podcastFunding) ? feed.podcastFunding?.map((f) => fundingCompat(f)) : [],
        generator: feed.generator,
        guid: feed.guid,
        imageURL: feed.itunesImage || feed.image?.url,
        language: feed.language,
        lastBuildDate: feed.lastBuildDate,
        link: feed.link,
        liveItems: feed.podcastLiveItems ?? [],
        medium: feed.medium ?? Phase4Medium.Podcast,
        owner: feed.owner,
        pubDate: feed.pubDate,
        subtitle: feed.subtitle,
        summary: feed.summary,
        title: feed.title,
        type: feed.itunesType,
        value: feed.value ? [valueCompat(feed.value)] : []
      }
    }

    // Convert the podcast-partytime schema to a podverse compatible schema.
    const itemCompat = (episode: EpisodeObject) => {
      return {
        alternateEnclosures: episode.alternativeEnclosures ?? [],
        author: [episode.author],
        chapters: episode.podcastChapters,
        contentLinks: [],
        description: episode.description,
        duration: episode.duration,
        enclosure: episode.enclosure,
        explicit: episode.explicit,
        // funding: Array.isArray(episode.podcastFunding) ? episode.podcastFunding?.map((f) => fundingCompat(f)) : [],
        guid: episode.guid,
        imageURL: episode.image,
        link: episode.link,
        pubDate: episode.pubDate,
        socialInteraction: episode.podcastSocialInteraction ?? [],
        soundbite: episode.podcastSoundbites ?? [],
        subtitle: episode.subtitle,
        summary: episode.summary,
        title: episode.title,
        transcript: episode.podcastTranscripts ?? [],
        value: episode.value ? [valueCompat(episode.value)] : []
      } as ParsedEpisode
    }

    const liveItemCompatToParsedEpisode = (liveItem: Phase4PodcastLiveItem) => {
      return {
        alternateEnclosures: liveItem.alternativeEnclosures ?? [],
        author: [liveItem.author],
        chapters: null,
        contentLinks: liveItem.contentLinks ?? [],
        description: liveItem.description,
        duration: 0,
        enclosure: liveItem.enclosure,
        explicit: false, // liveItem.explicit,
        guid: liveItem.guid,
        imageURL: '', // liveItem.image,
        link: liveItem.link,
        liveItemEnd: liveItem.end,
        liveItemStart: liveItem.start,
        liveItemStatus: liveItem.status,
        pubDate: null,
        socialInteraction: [],
        soundbite: [],
        subtitle: '', // liveItem.subtitle,
        summary: '', // liveItem.summary,
        title: liveItem.title,
        transcript: [],
        value: liveItem.value ? [valueCompat(liveItem.value)] : []
      } as ParsedEpisode
    }

    const meta = feedCompat(parsedFeed)
    const parsedEpisodes = parsedFeed.items.map(itemCompat)
    const parsedLiveItemEpisodes = meta.liveItems.map(liveItemCompatToParsedEpisode)

    let podcast = new Podcast()
    if (feedUrl.podcast) {
      logPerformance('feedUrl.podcast getPodcast', _logStart)
      const savedPodcast = await getPodcast(feedUrl.podcast.id, false)
      logPerformance('feedUrl.podcast getPodcast', _logEnd)
      if (!savedPodcast) throw Error('Invalid podcast id provided.')
      podcast = savedPodcast
    }

    logPerformance('podcast id', podcast.id)

    const hasLiveItem = podcast.hasLiveItem || parsedLiveItemEpisodes.length > 0
    const latestLiveItemStatus = parseLatestLiveItemStatus(parsedLiveItemEpisodes)
    const { liveItemLatestImageUrl, liveItemLatestPubDate, liveItemLatestTitle } =
      parseLatestLiveItemInfo(parsedLiveItemEpisodes)

    const { mostRecentEpisodePubDate, mostRecentUpdateDateFromFeed } = getMostRecentPubDateFromFeed(
      meta,
      parsedEpisodes
    )
    const previousLastEpisodePubDate = podcast.lastEpisodePubDate
    const shouldSendNewEpisodeNotification =
      (!previousLastEpisodePubDate && mostRecentEpisodePubDate) ||
      (previousLastEpisodePubDate &&
        mostRecentEpisodePubDate &&
        new Date(previousLastEpisodePubDate) < new Date(mostRecentEpisodePubDate))

    const previousLiveItemStatus = podcast.latestLiveItemStatus
    const shouldSendLiveNotification = latestLiveItemStatus === 'live' && previousLiveItemStatus !== 'live'

    // Stop parsing if the feed has not been updated since it was last parsed.
    if (
      !forceReparsing &&
      podcast.feedLastUpdated &&
      mostRecentUpdateDateFromFeed &&
      // we always want to parse feeds that have liveItem tags, so we get the latest liveItem status
      !hasLiveItem &&
      new Date(podcast.feedLastUpdated) >= new Date(mostRecentUpdateDateFromFeed) &&
      !podcast.alwaysFullyParse
    ) {
      console.log('Stop parsing if the feed has not been updated since it was last parsed')
      return
    }

    let authors: Author[] = []
    if (Array.isArray(meta.author) && meta.author.length > 0) {
      logPerformance('findOrGenerateAuthors', _logStart)
      authors = (await findOrGenerateAuthors(meta.author)) as never
      logPerformance('findOrGenerateAuthors', _logEnd)
    }
    const authorRepo = getRepository(Author)
    logPerformance('authorRepo.save', _logStart)
    await authorRepo.save(authors)
    logPerformance('authorRepo.save', _logEnd)
    podcast.authors = authors

    let categories: Category[] = []
    if (Array.isArray(meta.categories) && meta.categories.length > 0) {
      logPerformance('findCategories', _logStart)
      categories = await findCategories(meta.categories)
      logPerformance('findCategories', _logEnd)
    }
    const categoryRepo = getRepository(Category)
    logPerformance('categoryRepo.save', _logStart)
    await categoryRepo.save(categories)
    logPerformance('categoryRepo.save', _logEnd)
    podcast.categories = categories

    podcast.description = meta.description
    podcast.feedLastParseFailed = false

    const feedLastUpdated = new Date(mostRecentUpdateDateFromFeed || meta.lastBuildDate || meta.pubDate || '')
    podcast.feedLastUpdated = isValidDate(feedLastUpdated) ? feedLastUpdated : new Date()

    podcast.funding = meta.funding
    podcast.guid = meta.guid

    podcast.imageUrl = meta.imageURL

    podcast.isExplicit = meta.explicit
    podcast.isPublic = true
    podcast.language = meta.language

    /*
      Generate the episode data to be saved later,
      and also set podcast fields based on the most recent episode's data.
    */
    let newEpisodes = [] as any
    let updatedSavedEpisodes = [] as any
    let newLiveItems = [] as any
    let updatedSavedLiveItems = [] as any
    let latestEpisodeImageUrl = ''
    if (parsedEpisodes && Array.isArray(parsedEpisodes)) {
      logPerformance('findOrGenerateParsedEpisodes', _logStart)
      const episodesResults = (await findOrGenerateParsedEpisodes(parsedEpisodes, podcast)) as any
      logPerformance('findOrGenerateParsedEpisodes', _logEnd)

      logPerformance('findOrGenerateParsedLiveItems', _logStart)
      const liveItemsResults = (await findOrGenerateParsedLiveItems(parsedLiveItemEpisodes, podcast)) as any
      logPerformance('findOrGenerateParsedLiveItems', _logEnd)

      podcast.hasLiveItem = hasLiveItem
      podcast.hasVideo = episodesResults.hasVideo || liveItemsResults.hasVideo

      newEpisodes = episodesResults.newEpisodes
      updatedSavedEpisodes = episodesResults.updatedSavedEpisodes
      newEpisodes = newEpisodes && newEpisodes.length > 0 ? newEpisodes : []
      updatedSavedEpisodes = updatedSavedEpisodes && updatedSavedEpisodes.length > 0 ? updatedSavedEpisodes : []

      newLiveItems = liveItemsResults.newLiveItems
      updatedSavedLiveItems = liveItemsResults.updatedSavedLiveItems
      newLiveItems = newLiveItems && newLiveItems.length > 0 ? newLiveItems : []
      updatedSavedLiveItems = updatedSavedLiveItems && updatedSavedLiveItems.length > 0 ? updatedSavedLiveItems : []

      const latestNewEpisode = newEpisodes.reduce((r: any, a: any) => {
        return r.pubDate > a.pubDate ? r : a
      }, [])

      const latestUpdatedSavedEpisode = updatedSavedEpisodes.reduce((r: any, a: any) => {
        return r.pubDate > a.pubDate ? r : a
      }, [])

      const latestEpisode =
        (!Array.isArray(latestNewEpisode) && latestNewEpisode) ||
        ((!Array.isArray(latestUpdatedSavedEpisode) && latestUpdatedSavedEpisode) as any)

      const lastEpisodePubDate =
        liveItemLatestPubDate && new Date(liveItemLatestPubDate) > new Date(latestEpisode.pubDate)
          ? new Date(liveItemLatestPubDate)
          : new Date(latestEpisode.pubDate)

      podcast.lastEpisodePubDate = isValidDate(lastEpisodePubDate) ? lastEpisodePubDate : undefined
      podcast.lastEpisodeTitle = latestEpisode.title

      latestEpisodeImageUrl = latestEpisode.imageUrl || ''
    } else {
      podcast.lastEpisodePubDate = undefined
      podcast.lastEpisodeTitle = ''
    }

    podcast.latestLiveItemStatus = latestLiveItemStatus
    podcast.linkUrl = meta.link
    podcast.medium = meta.medium
    podcast.sortableTitle = meta.title ? convertToSortableTitle(meta.title) : ''
    podcast.subtitle = meta.subtitle
    podcast.title = meta.title
    podcast.type = meta.type
    podcast.value = meta.value

    if ((!podcast.value || podcast.value.length === 0) && podcast.hasPodcastIndexValueTag && podcast.podcastIndexId) {
      try {
        podcast.value = await getPodcastValueTagForPodcastIndexId(podcast.podcastIndexId)
      } catch (error) {
        console.log('getPodcastValueTagForPodcastIndexId error', error)
      }
    }

    const podcastRepo = getRepository(Podcast)

    logPerformance('podcastRepo.save', _logStart)
    await podcastRepo.save(podcast)
    logPerformance('podcastRepo.save', _logEnd)
    // Limit podcast image PUTs to save on server costs
    const { shrunkImageLastUpdated } = podcast
    const recentTimeRange = s3ImageLimitUpdateDays * 24 * 60 * 60 * 1000
    const wasUpdatedWithinRecentTimeRange = shrunkImageLastUpdated
      ? new Date(shrunkImageLastUpdated).getTime() + recentTimeRange >= new Date().getTime()
      : false
    if (forceReparsing || !wasUpdatedWithinRecentTimeRange || podcast.alwaysFullyParse) {
      await uploadImageToS3AndSaveToDatabase(podcast, podcastRepo)
    }

    const episodeRepo = getRepository(Episode)
    logPerformance('episodeRepo.save updatedSavedEpisodes', updatedSavedEpisodes.length, _logStart)
    await episodeRepo.save(updatedSavedEpisodes, { chunk: 400 })
    logPerformance('episodeRepo.save updatedSavedEpisodes', _logEnd)

    logPerformance('episodeRepo.save newEpisodes', newEpisodes.length, _logStart)
    await episodeRepo.save(newEpisodes, { chunk: 400 })
    logPerformance('episodeRepo.save newEpisodes', _logEnd)

    logPerformance('episodeRepo.save updatedSavedLiveItems', updatedSavedLiveItems.length, _logStart)
    await episodeRepo.save(updatedSavedLiveItems, { chunk: 400 })
    logPerformance('episodeRepo.save updatedSavedLiveItems', _logEnd)

    logPerformance('episodeRepo.save newLiveItems', newLiveItems.length, _logStart)
    await episodeRepo.save(newLiveItems, { chunk: 400 })
    logPerformance('episodeRepo.save newLiveItems', _logEnd)

    const feedUrlRepo = getRepository(FeedUrl)
    const cleanedFeedUrl = {
      id: feedUrl.id,
      url: feedUrl.url,
      podcast
    }

    logPerformance('feedUrlRepo.update', _logStart)
    await feedUrlRepo.update(feedUrl.id, cleanedFeedUrl)
    logPerformance('feedUrlRepo.update', _logEnd)

    if (shouldSendNewEpisodeNotification) {
      logPerformance('sendNewEpisodeDetectedNotification', _logStart)
      const finalPodcastImageUrl = podcast.shrunkImageUrl || podcast.imageUrl
      const finalEpisodeImageUrl = latestEpisodeImageUrl
      await sendNewEpisodeDetectedNotification(
        podcast.id,
        podcast.title,
        podcast.lastEpisodeTitle,
        finalPodcastImageUrl,
        finalEpisodeImageUrl
      )
      logPerformance('sendNewEpisodeDetectedNotification', _logEnd)
    }

    if (shouldSendLiveNotification) {
      logPerformance('sendLiveItemLiveDetectedNotification', _logStart)
      const finalPodcastImageUrl = podcast.shrunkImageUrl || podcast.imageUrl
      const finalEpisodeImageUrl = liveItemLatestImageUrl
      await sendLiveItemLiveDetectedNotification(
        podcast.id,
        podcast.title,
        liveItemLatestTitle,
        finalPodcastImageUrl,
        finalEpisodeImageUrl
      )
      logPerformance('sendLiveItemLiveDetectedNotification', _logEnd)
    }

    logPerformance('updatedSavedEpisodes updateSoundBites', _logStart)
    for (const updatedSavedEpisode of updatedSavedEpisodes) {
      const soundBiteArray = updatedSavedEpisode.soundbite
      if (Array.isArray(soundBiteArray) && soundBiteArray.length > 0) {
        await updateSoundBites(
          updatedSavedEpisode.id,
          updatedSavedEpisode.soundbite,
          updatedSavedEpisode.title,
          podcast.title
        )
      }
    }
    logPerformance('updatedSavedEpisodes updateSoundBites', _logEnd)

    logPerformance('newEpisodes updateSoundBites', _logStart)
    for (const newEpisode of newEpisodes) {
      const soundBiteArray = newEpisode.soundbite
      if (Array.isArray(soundBiteArray) && soundBiteArray.length > 0) {
        await updateSoundBites(newEpisode.id, newEpisode.soundbite, newEpisode.title, podcast.title)
      }
    }
    logPerformance('newEpisodes updateSoundBites', _logEnd)
  } catch (error) {
    throw error
  } finally {
    clearTimeout(abortTimeout)
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
        podcast.shrunkImageLastUpdated = new Date()
        logPerformance('shrunkImageUrl podcast save', _logStart)
        await podcastRepo.save(podcast)
        logPerformance('shrunkImageUrl podcast save', _logEnd)
      }
    }
  }
}

export const parseFeedUrlsByPodcastIds = async (podcastIds: string[]) => {
  const feedUrls = await getFeedUrls({
    podcastId: podcastIds,
    isAuthority: true
  })

  for (const feedUrl of feedUrls) {
    try {
      const forceReparsing = true
      const cacheBust = false
      await parseFeedUrl(feedUrl, forceReparsing, cacheBust)
    } catch (error) {
      await handlePodcastFeedLastParseFailed(feedUrl, error)
    }
  }

  console.log('parseFeedUrlsByPodcastIds finished')
  return
}

export const parseFeedUrlsByPodcastIndexIds = async (podcastIndexIds: string[]) => {
  const feedUrls = await getFeedUrlsByPodcastIndexIds(podcastIndexIds)

  for (const feedUrl of feedUrls) {
    try {
      const forceReparsing = true
      const cacheBust = false
      await parseFeedUrl(feedUrl, forceReparsing, cacheBust)
    } catch (error) {
      await handlePodcastFeedLastParseFailed(feedUrl, error)
    }
  }

  console.log('getFeedUrlsByPodcastIndexIds finished')
  return
}

export const parsePublicFeedUrls = async () => {
  const repository = getRepository(FeedUrl)

  const qb = repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.id')
    .addSelect('feedUrl.url')
    .innerJoinAndSelect('feedUrl.podcast', 'podcast', 'podcast.isPublic = :isPublic', {
      isPublic: true
    })
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
  const { cacheBust, forceReparsing } = feedUrlMsg
  let feedUrl

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    logPerformance('parseNextFeedFromQueue > find feedUrl in db', _logStart, 'queueUrl ' + queueUrl)
    feedUrl = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .innerJoinAndSelect('feedUrl.podcast', 'podcast')
      .where('feedUrl.id = :id', { id: feedUrlMsg.id })
      .getOne()
    logPerformance('parseNextFeedFromQueue > find feedUrl in db', _logEnd, 'queueUrl ' + queueUrl)

    if (feedUrl) {
      try {
        await parseFeedUrl(feedUrl, !!forceReparsing, !!cacheBust)
      } catch (error) {
        console.log('error parseNextFeedFromQueue parseFeedUrl', feedUrl.id, feedUrl.url)
        console.log('error', error)
        throw error
      }
    } else {
      try {
        await parseFeedUrl(feedUrlMsg, !!forceReparsing, !!cacheBust)
      } catch (error) {
        console.log('parsePublicFeedUrls feedUrlMsg parseFeedUrl', feedUrlMsg)
        console.log('error', error)
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
    const forceReparsing = false
    const cacheBust = false
    const attrs = generateFeedMessageAttributes(feedUrlMsg, inheritedError, forceReparsing, cacheBust)
    await sendMessageToQueue(attrs, errorsQueueUrl)
  }
}

const findOrGenerateAuthors = async (authorNames) => {
  const authorRepo = getRepository(Author)
  // Make sure to remove duplicate values to avoid unique slug/name value collisions
  const authorNamesArray = [...new Set(authorNames.map((x) => x.trim()))]
  const allAuthorSlugs = authorNamesArray.map((x) => convertToSlug(x))

  let existingAuthors = [] as any
  if (allAuthorSlugs && allAuthorSlugs.length > 0) {
    existingAuthors = await authorRepo.find({
      where: {
        slug: In(allAuthorSlugs)
      }
    })
  }

  const newAuthors = []
  const newAuthorNames = authorNamesArray.filter((x) => {
    return !existingAuthors.find((existingAuthor) => {
      return existingAuthor.slug === convertToSlug(x)
    })
  })

  for (const name of newAuthorNames) {
    const author = generateAuthor(name) as never
    newAuthors.push(author)
  }

  for (const existingAuthor of existingAuthors) {
    const matchedName = authorNamesArray.find((x) => convertToSlug(x) === existingAuthor.slug)
    existingAuthor.name = matchedName
  }

  const allAuthors = existingAuthors.concat(newAuthors)

  return allAuthors
}

const generateAuthor = (name) => {
  const author = new Author()
  author.name = name
  return author
}

const findCategories = async (categories: string[]) => {
  const c: string[] = []
  for (const category of categories) {
    if (category.indexOf('>') > 0) {
      c.push(category.substr(0, category.indexOf('>')).replace(/\s/g, ''))
    }
    c.push(category.replace(/\s/g, ''))
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

const getMostRecentPubDateFromFeed = (meta, episodes) => {
  const mostRecentEpisode = episodes.reduce((r: any, a: any) => {
    return new Date(r.pubDate) > new Date(a.pubDate) ? r : a
  }, [])
  const mostRecentEpisodePubDate = mostRecentEpisode && mostRecentEpisode.pubDate
  let mostRecentUpdateDateFromFeed = mostRecentEpisode && mostRecentEpisode.pubDate

  /*
    NOTE: This helper is needed to let us know if a feed has been updated recently
    and has to be fully parsed, or if it hasn't been updated recently and can be skipped.
    We usually want to use the lastBuildDate when it is available
    because sometimes a feed will update/remove old episodes, without adding a new mostRecentEpisode.
    HOWEVER, there are some feeds that always return the current time as the lastBuildDate,
    and in those cases, the lastBuildDate will always be more recent than the mostRecentEpisode.pubDate,
    so the feed will never parse...
    AND...if PodPing tells us to update a feed, it is possible that we receive that notification
    very shortly after the lastBuildDate is set for a podcast...
    SO to handle all this, I'm always using the lastBuildDate *unless* the lastBuildDate is within
    2 minutes of the current time, in which case we'll use the mostRecentEpisode.pubDate instead,
    and feeds that have any liveItems will always be fully parsed no matter what.
  */

  const currentDateTime = new Date()
  const currentDateTimeTwoMinutesEarlier = new Date(currentDateTime)
  currentDateTimeTwoMinutesEarlier.setMinutes(currentDateTime.getMinutes() - 2)
  if (!meta.lastBuildDate && mostRecentEpisodePubDate) {
    mostRecentUpdateDateFromFeed = mostRecentEpisodePubDate
  } else if (!mostRecentEpisodePubDate && meta.lastBuildDate) {
    mostRecentUpdateDateFromFeed = meta.lastBuildDate
  } else if (meta.lastBuildDate && mostRecentEpisodePubDate) {
    if (new Date(meta.lastBuildDate) > currentDateTimeTwoMinutesEarlier) {
      mostRecentUpdateDateFromFeed = mostRecentEpisodePubDate
    } else {
      mostRecentUpdateDateFromFeed =
        new Date(mostRecentEpisodePubDate) >= new Date(meta.lastBuildDate)
          ? mostRecentEpisodePubDate
          : meta.lastBuildDate
    }
  }

  return { mostRecentEpisodePubDate, mostRecentUpdateDateFromFeed }
}

const assignParsedEpisodeData = async (episode: ExtendedEpisode, parsedEpisode: ParsedEpisode, podcast) => {
  episode.isPublic = true

  episode.alternateEnclosures = parsedEpisode.alternateEnclosures
  if (parsedEpisode.chapters) {
    episode.chaptersUrl = parsedEpisode.chapters.url
    episode.chaptersType = parsedEpisode.chapters.type
  }
  episode.description = parsedEpisode.description
  episode.duration = parsedEpisode.duration ? parseInt(parsedEpisode.duration, 10) : 0
  /* TODO: podcast-partytime is missing type and funding on episode */
  // episode.episodeType = parsedEpisode.type
  // episode.funding = parsedEpisode.funding
  episode.guid = parsedEpisode.guid
  episode.imageUrl = parsedEpisode.imageURL
  episode.isExplicit = parsedEpisode.explicit
  episode.linkUrl = parsedEpisode.link

  episode.mediaType = parsedEpisode.enclosure.type
  const mediumVideoOverrides = ['video', 'film']
  if (!episode.mediaType && mediumVideoOverrides.includes(podcast?.medium)) {
    episode.mediaType = 'video/mp4'
  }

  episode.mediaUrl = parsedEpisode.enclosure.url

  const pubDate = new Date(parsedEpisode.pubDate)
  episode.pubDate = isValidDate(pubDate) ? pubDate : new Date()

  episode.socialInteraction = parsedEpisode.socialInteraction
  episode.soundbite = parsedEpisode.soundbite
  episode.subtitle = parsedEpisode.subtitle
  episode.title = parsedEpisode.title
  episode.transcript = parsedEpisode.transcript
  episode.value = parsedEpisode.value

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

  if (parsedEpisode.liveItemStart && parsedEpisode.liveItemStatus && parsedEpisode.guid) {
    let liveItem = await getLiveItemByGuid(parsedEpisode.guid, podcast.id)

    if (!liveItem) {
      liveItem = new LiveItem()
    }

    liveItem.end = parsedEpisode.liveItemEnd || null
    liveItem.start = parsedEpisode.liveItemStart
    liveItem.status = parsedEpisode.liveItemStatus
    episode.liveItem = liveItem

    // If a livestream has ended, set it to isPublic=false
    // so it doesn't get returned in requests anymore.
    if (liveItem.status === 'ended') {
      episode.isPublic = false
    }
  } else {
    episode.liveItem = null
  }

  return episode
}

/*
  Livestreams will often use the same episode.enclosure.url every time,
  so we need to handle the new/update episode/liveitem logic separately.
  For liveItems, we rely on a guid instead of the enclosure.url.
  Sorry...this whole parser should be rewritten from scratch.
*/

const findOrGenerateParsedLiveItems = async (parsedLiveItems, podcast) => {
  const episodeRepo = getRepository(Episode)

  // Parsed episodes are only valid if they have enclosure.url, liveItemStart, and guid tags,
  // so ignore all that do not.
  const validParsedLiveItems = parsedLiveItems.reduce((result, x) => {
    if (x.enclosure && x.enclosure.url && x.liveItemStart && x.guid) result.push(x)
    return result
  }, [])

  const parsedLiveItemGuids = validParsedLiveItems.map((x) => x.guid)

  // Find liveItems (episodes) in the database that have matching guids AND podcast ids to
  // those found in the parsed object, then store an array of just those guids.
  let savedLiveItems = [] as any

  if (parsedLiveItemGuids && parsedLiveItemGuids.length > 0) {
    savedLiveItems = await episodeRepo.find({
      where: {
        podcast,
        guid: In(parsedLiveItemGuids)
      }
    })
  }

  /*
    If liveItems exist in the database for this podcast,
    but they aren't currently in the feed, then retrieve
    and set them to isPublic = false
  */
  let liveItemsToHide = await episodeRepo.find({
    where: {
      podcast,
      isPublic: true,
      guid: Not(In(parsedLiveItemGuids))
    }
  })

  liveItemsToHide = liveItemsToHide.filter((x) => x.liveItem)

  const updatedLiveItemsToHide = liveItemsToHide.map((x: ExtendedEpisode) => {
    x.isPublic = false
    return x
  })
  await episodeRepo.save(updatedLiveItemsToHide, { chunk: 400 })

  const savedLiveItemGuids = savedLiveItems.map((x) => x.guid)

  // Create an array of only the parsed liveItems that do not have a match
  // already saved in the database.
  const newParsedLiveItems = validParsedLiveItems.filter((x) => !savedLiveItemGuids.includes(x.guid))
  const updatedSavedLiveItems = [] as any
  const newLiveItems = [] as any

  /* If a feed has more video episodes than audio episodes, mark it as a hasVideo podcast. */
  let videoCount = 0
  let audioCount = 0

  // If episode is already saved, then merge the matching episode found in
  // the parsed object with what is already saved.
  for (let existingLiveItem of savedLiveItems) {
    const parsedLiveItem = validParsedLiveItems.find((x) => x.guid === existingLiveItem.guid)
    existingLiveItem = await assignParsedEpisodeData(existingLiveItem, parsedLiveItem, podcast)

    if (parsedLiveItem.mediaType && parsedLiveItem.mediaType.indexOf('video') >= 0) {
      videoCount++
    } else {
      audioCount++
    }

    if (!updatedSavedLiveItems.some((x: any) => x.guid === existingLiveItem.guid)) {
      updatedSavedLiveItems.push(existingLiveItem)
    }
  }

  // If liveItem from the parsed object is new (not already saved),
  // then create a new liveItem (episode).
  for (const newParsedLiveItem of newParsedLiveItems) {
    let episode = new Episode() as ExtendedEpisode
    episode = await assignParsedEpisodeData(episode, newParsedLiveItem, podcast)

    if (newParsedLiveItem.mediaType && newParsedLiveItem.mediaType.indexOf('video') >= 0) {
      videoCount++
    } else {
      audioCount++
    }

    if (!newLiveItems.some((x: any) => x.guid === episode.guid)) {
      newLiveItems.push(episode)
    }
  }

  return {
    newLiveItems,
    updatedSavedLiveItems,
    hasVideo: videoCount > audioCount
  }
}

const findOrGenerateParsedEpisodes = async (parsedEpisodes, podcast) => {
  const episodeRepo = getRepository(Episode)

  // Parsed episodes are only valid if they have enclosure.url tags,
  // so ignore all that do not.
  const validParsedEpisodes = parsedEpisodes.reduce((result, x) => {
    if (x.enclosure && x.enclosure.url && !x.liveItemStart) result.push(x)
    return result
  }, [])
  // Create an array of only the episode media URLs from the parsed object
  const parsedEpisodeMediaUrls = validParsedEpisodes.map((x) => x.enclosure.url)

  // Find episodes in the database that have matching episode media URLs AND podcast ids to
  // those found in the parsed object, then store an array of just those URLs.
  let savedEpisodes = [] as any
  if (parsedEpisodeMediaUrls && parsedEpisodeMediaUrls.length > 0) {
    savedEpisodes = await episodeRepo.find({
      where: {
        podcast,
        mediaUrl: In(parsedEpisodeMediaUrls)
      }
    })

    /*
      If episodes exist in the database for this podcast,
      but they aren't currently in the feed, then retrieve
      and set them to isPublic = false
    */
    const episodesToHide = await episodeRepo.find({
      where: {
        podcast,
        isPublic: true,
        mediaUrl: Not(In(parsedEpisodeMediaUrls))
      }
    })

    const updatedEpisodesToHide = episodesToHide.map((x: ExtendedEpisode) => {
      x.isPublic = false
      return x
    })
    await episodeRepo.save(updatedEpisodesToHide, { chunk: 400 })
  }

  const savedEpisodeMediaUrls = savedEpisodes.map((x) => x.mediaUrl)

  // Create an array of only the parsed episodes that do not have a match
  // already saved in the database.
  const newParsedEpisodes = validParsedEpisodes.filter((x) => !savedEpisodeMediaUrls.includes(x.enclosure.url))

  const updatedSavedEpisodes = [] as any
  const newEpisodes = [] as any

  /* If a feed has more video episodes than audio episodes, mark it as a hasVideo podcast. */
  let videoCount = 0
  let audioCount = 0

  // If episode is already saved, then merge the matching episode found in
  // the parsed object with what is already saved.
  for (let existingEpisode of savedEpisodes) {
    const parsedEpisode = validParsedEpisodes.find((x) => x.enclosure.url === existingEpisode.mediaUrl)
    existingEpisode = await assignParsedEpisodeData(existingEpisode, parsedEpisode, podcast)

    if (existingEpisode.mediaType && existingEpisode.mediaType.indexOf('video') >= 0) {
      videoCount++
    } else {
      audioCount++
    }

    if (!updatedSavedEpisodes.some((x: any) => x.mediaUrl === existingEpisode.mediaUrl)) {
      updatedSavedEpisodes.push(existingEpisode)
    }
  }

  // If episode from the parsed object is new (not already saved),
  // then create a new episode.
  for (const newParsedEpisode of newParsedEpisodes) {
    let episode = new Episode() as ExtendedEpisode
    episode = await assignParsedEpisodeData(episode, newParsedEpisode, podcast)

    if (newParsedEpisode.mediaType && newParsedEpisode.mediaType.indexOf('video') >= 0) {
      videoCount++
    } else {
      audioCount++
    }

    if (!newEpisodes.some((x: any) => x.mediaUrl === episode.mediaUrl)) {
      newEpisodes.push(episode)
    }
  }

  return {
    newEpisodes,
    updatedSavedEpisodes,
    hasVideo: videoCount > audioCount
  }
}

export const generateFeedMessageAttributes = (
  feedUrl,
  error = {} as any,
  forceReparsing: boolean,
  cacheBust: boolean
) => {
  return {
    id: {
      DataType: 'String',
      StringValue: feedUrl.id
    },
    url: {
      DataType: 'String',
      StringValue: feedUrl.url
    },
    ...(feedUrl.podcast && feedUrl.podcast.id
      ? {
          podcastId: {
            DataType: 'String',
            StringValue: feedUrl.podcast && feedUrl.podcast.id
          }
        }
      : {}),
    ...(feedUrl.podcast && feedUrl.podcast.title
      ? {
          podcastTitle: {
            DataType: 'String',
            StringValue: feedUrl.podcast && feedUrl.podcast.title
          }
        }
      : {}),
    ...(forceReparsing
      ? {
          forceReparsing: {
            DataType: 'String',
            StringValue: 'TRUE'
          }
        }
      : {}),
    ...(cacheBust
      ? {
          cacheBust: {
            DataType: 'String',
            StringValue: 'TRUE'
          }
        }
      : {}),
    ...(error && error.message
      ? {
          errorMessage: {
            DataType: 'String',
            StringValue: error.message
          }
        }
      : {})
  }
}

const extractFeedMessage = (message) => {
  const attrs = message.MessageAttributes
  return {
    id: attrs.id.StringValue,
    url: attrs.url.StringValue,
    ...(attrs.podcastId && attrs.podcastTitle
      ? {
          podcast: {
            id: attrs.podcastId.StringValue,
            title: attrs.podcastTitle.StringValue
          }
        }
      : {}),
    ...(attrs.forceReparsing ? { forceReparsing: true } : {}),
    ...(attrs.cacheBust ? { cacheBust: true } : {}),
    receiptHandle: message.ReceiptHandle
  } as any
}
