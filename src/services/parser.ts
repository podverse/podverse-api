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
import { updateSoundBites } from '~/controllers/mediaRef'
import { getPodcast } from '~/controllers/podcast'
import { Author, Category, Episode, FeedUrl, LiveItem, Podcast } from '~/entities'
import type { Value } from '~/entities/podcast'
import {
  _logEnd,
  _logStart,
  convertToSlug,
  convertToSortableTitle,
  isValidDate,
  logPerformance,
  checkIfVideoMediaType
} from '~/lib/utility'
import { deleteMessage, receiveMessageFromQueue, sendMessageToQueue } from '~/services/queue'
import { getFeedUrls, getFeedUrlsByPodcastIndexIds } from '~/controllers/feedUrl'
import { shrinkImage } from './imageShrinker'
import { Phase4PodcastLiveItem } from 'podcast-partytime/dist/parser/phase/phase-4'
import {
  sendLiveItemLiveDetectedNotification,
  sendNewEpisodeDetectedNotification
} from '~/lib/notifications/fcmGoogleApi'
import {
  getAllEpisodeValueTagsFromPodcastIndexById,
  getPodcastValueTagForPodcastIndexId
} from '~/services/podcastIndex'
import {
  getEpisodeByPodcastIdAndGuid,
  getEpisodesWithLiveItemsWithMatchingGuids,
  getEpisodesWithLiveItemsWithoutMatchingGuids
} from '~/controllers/episode'
import { getLiveItemByGuid } from '~/controllers/liveItem'
import { PhasePendingChat } from 'podcast-partytime/dist/parser/phase/phase-pending'
const { awsConfig, userAgent } = config
const { queueUrls /*, s3ImageLimitUpdateDays */ } = awsConfig

interface ExtendedEpisode extends Episode {
  soundbite: any[]
}

interface ExtendedPhase4PodcastLiveItem extends Phase4PodcastLiveItem {
  chat?: PhasePendingChat
  image?: string
}

interface ExtendedChat extends Omit<PhasePendingChat, 'phase'> {
  phase?: 'pending' | '4'
  url?: string
}

type LiveItemNotification = {
  podcastId: string
  podcastTitle: string
  episodeTitle: string
  podcastImageUrl?: string
  episodeImageUrl?: string
  episodeGuid: string
}

const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))
const abortTimeLimit = 60000 // abort if request takes longer than 1 minute

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const parseFeedUrl = async (feedUrl, forceReparsing = false, cacheBust = false, allowNonPublic?: boolean) => {
  logPerformance('parseFeedUrl', _logStart, 'feedUrl.url ' + feedUrl.url)

  const abortController = new AbortController()
  let abortTimeout = setTimeout(() => {
    console.log('abortController abortTimeout 1', feedUrl)
    abortController.abort()
  }, abortTimeLimit)

  try {
    /* Temporary: Stop parsing papi.qingting.fm domain until mediaUrl/guid switch is completed */
    const isQingTing = feedUrl.url.indexOf('qingting.fm') > -1
    if (isQingTing) {
      console.log('Temporary: Stop parsing papi.qingting.fm domain until mediaUrl/guid switch is completed')
      return
    }

    // NOTE: cacheBust should be renamed to "shouldRetry" because we are actually
    // adding cacheBust as a URL parameter in all cases. The only reason we need the
    // parseFeedUrl cacheBust parameter is to use in the retry handler for liveItems.

    const excludeCacheBust = feedUrl?.podcast?.excludeCacheBust
    const urlToParse = !excludeCacheBust ? addParameterToURL(feedUrl.url, `cacheBust=${Date.now()}`) : feedUrl.url
    console.log('*** urlToParse', urlToParse)

    let xml
    let parsedFeed
    let retryCount = 1
    const retryMax = 3 // retry up to 3 times
    const retryTime = 30000 // retry every 30 seconds

    const podcastFetchAndParse = async () => {
      logPerformance(`podcastFetchAndParse attempt ${retryCount}`, _logStart)
      return nodeFetch(urlToParse, {
        headers: { 'User-Agent': userAgent },
        follow: 5,
        size: 40000000,
        signal: abortController.signal
      })
        .then(async (resp) => {
          if (resp.ok) {
            xml = await resp.text()
            parsedFeed = parseFeed(xml, { allowMissingGuid: true })
            logPerformance('podcastFetchAndParse', _logEnd)
          } else {
            const errorBody = await resp.text()
            throw new Error(errorBody)
          }
        })
        .catch(async (error) => {
          console.log('nodeFetch error:', error)

          // Only retrying when cacheBust is true to handle the special case of Podping livestream updates.
          // When cacheBust is false, it means we are parsing based on updates from Podcast Index API,
          // and we already will attempt to reparse PI API feeds every 15 minutes with the redundancy
          // in our current PI API syncing setup.
          if (cacheBust && retryCount < retryMax) {
            clearTimeout(abortTimeout)
            await delay(retryTime)
            retryCount++
            abortTimeout = setTimeout(() => {
              console.log('abortController abortTimeout 2', feedUrl, cacheBust, retryCount, retryMax)
              abortController.abort()
            }, abortTimeLimit) // abort if request takes longer than 1 minute
            await podcastFetchAndParse()
          } else if (cacheBust) {
            throw new Error('nodeFetch retry attempt exceeded. ' + error)
          } else {
            throw new Error(error)
          }
        })
    }

    await podcastFetchAndParse()

    clearTimeout(abortTimeout)

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
        description: episode.content || episode.description,
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
        summary: getLongerSummary(episode.content, episode.description),
        title: episode.title,
        transcript: episode.podcastTranscripts ?? [],
        value: episode.value ? [valueCompat(episode.value)] : []
      } as ParsedEpisode
    }

    const liveItemCompatToParsedEpisode = (liveItem: ExtendedPhase4PodcastLiveItem) => {
      const getChatEmbedUrlValue = (chat?: ExtendedChat) => {
        if (chat?.phase === 'pending' && chat.embedUrl) {
          return chat.embedUrl
        }
        // deprecated embed value
        else if (chat?.phase === '4' && chat.url) {
          return chat.url
        }
        return ''
      }

      return {
        alternateEnclosures: liveItem.alternativeEnclosures ?? [],
        author: [liveItem.author],
        // this is chatIRCURL in Podverse schema...probably a bad name since it could be any url :[
        chat: getChatEmbedUrlValue(liveItem.chat),
        chapters: null,
        contentLinks: liveItem.contentLinks ?? [],
        description: liveItem.description,
        duration: 0,
        enclosure: liveItem.enclosure,
        explicit: false, // liveItem.explicit,
        guid: liveItem.guid,
        imageURL: liveItem.image,
        link: liveItem.link,
        liveItemEnd: liveItem.end,
        liveItemStart: liveItem.start,
        liveItemStatus: liveItem.status?.toLowerCase(),
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

    // Whichever summary is longer we are assuming is the "full summary" and
    // assigning to the summary column.
    const getLongerSummary = (content?: string, description?: string) => {
      const contentLength = content ? content.length : 0
      const descriptionLength = description ? description.length : 0
      const longerSummary = contentLength >= descriptionLength ? content : description
      return longerSummary
    }

    const meta = feedCompat(parsedFeed)
    const parsedEpisodes = parsedFeed.items.map(itemCompat)
    const parsedLiveItemEpisodes = meta.liveItems.map(liveItemCompatToParsedEpisode)

    let podcast = new Podcast()
    if (feedUrl.podcast) {
      logPerformance('feedUrl.podcast getPodcast', _logStart)
      const savedPodcast = await getPodcast(feedUrl.podcast.id, false, allowNonPublic)
      logPerformance('feedUrl.podcast getPodcast', _logEnd)
      if (!savedPodcast) throw Error('Invalid podcast id provided.')
      podcast = savedPodcast
    }

    logPerformance('podcast id', podcast.id)

    const hasLiveItem = podcast.hasLiveItem || parsedLiveItemEpisodes.length > 0
    const latestLiveItemStatus = parseLatestLiveItemStatus(parsedLiveItemEpisodes)
    const { liveItemLatestPubDate } = parseLatestLiveItemInfo(parsedLiveItemEpisodes)

    const { mostRecentEpisodeTitle, mostRecentEpisodePubDate, mostRecentUpdateDateFromFeed } =
      getMostRecentEpisodeDataFromFeed(meta, parsedEpisodes)
    const previousLastEpisodePubDate = podcast.lastEpisodePubDate
    const previousLastEpisodeTitle = podcast.lastEpisodeTitle

    const shouldSendNewEpisodeNotification =
      (!previousLastEpisodePubDate && mostRecentEpisodePubDate) ||
      (previousLastEpisodePubDate &&
        mostRecentEpisodePubDate &&
        new Date(previousLastEpisodePubDate) < new Date(mostRecentEpisodePubDate) &&
        previousLastEpisodeTitle !== mostRecentEpisodeTitle)

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

    // guid is deprecated
    podcast.guid = meta.guid
    // podcastGuid is the column we want to use going forward
    podcast.podcastGuid = meta.guid

    const hasNewImageUrl = meta.imageURL && podcast.imageUrl !== meta.imageURL
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
    let latestEpisodeGuid = ''
    let liveItemNotificationsData = [] as LiveItemNotification[]
    if (
      (parsedEpisodes && Array.isArray(parsedEpisodes) && parsedEpisodes.length > 0) ||
      (parsedLiveItemEpisodes && Array.isArray(parsedLiveItemEpisodes) && parsedLiveItemEpisodes.length > 0)
    ) {
      let pvEpisodesValueTagsByGuid = {}
      if (podcast.hasPodcastIndexValueTag && podcast.podcastIndexId) {
        try {
          pvEpisodesValueTagsByGuid = await getAllEpisodeValueTagsFromPodcastIndexById(podcast.podcastIndexId)
        } catch (error) {
          console.log('pvEpisodesValueTagsByGuid error', error)
        }
      }

      logPerformance('findOrGenerateParsedEpisodes', _logStart)
      const episodesResults = (await findOrGenerateParsedEpisodes(
        parsedEpisodes,
        podcast,
        pvEpisodesValueTagsByGuid
      )) as any
      logPerformance('findOrGenerateParsedEpisodes', _logEnd)

      logPerformance('findOrGenerateParsedLiveItems', _logStart)
      const liveItemsResults = (await findOrGenerateParsedLiveItems(
        parsedLiveItemEpisodes,
        podcast,
        pvEpisodesValueTagsByGuid
      )) as any
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

      liveItemNotificationsData = liveItemsResults.liveItemNotificationsData

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
      latestEpisodeGuid = latestEpisode.guid
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
    // const { shrunkImageLastUpdated } = podcast
    // const recentTimeRange = s3ImageLimitUpdateDays * 24 * 60 * 60 * 1000
    // const wasUpdatedWithinRecentTimeRange = shrunkImageLastUpdated
    //   ? new Date(shrunkImageLastUpdated).getTime() + recentTimeRange >= new Date().getTime()
    //   : false
    if (forceReparsing || hasNewImageUrl /* || !wasUpdatedWithinRecentTimeRange */ || podcast.alwaysFullyParse) {
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

      // Retrieve the episode to make sure we have the episode.id
      const latestEpisodeWithId = await getEpisodeByPodcastIdAndGuid(podcast.id, latestEpisodeGuid)

      if (latestEpisodeWithId?.id) {
        await sendNewEpisodeDetectedNotification(
          podcast.id,
          podcast.title,
          podcast.lastEpisodeTitle,
          finalPodcastImageUrl,
          finalEpisodeImageUrl,
          latestEpisodeWithId.id
        )
      }

      logPerformance('sendNewEpisodeDetectedNotification', _logEnd)
    }

    if (liveItemNotificationsData && liveItemNotificationsData.length > 0) {
      for (const liveItemNotificationData of liveItemNotificationsData) {
        logPerformance('sendLiveItemLiveDetectedNotification', _logStart)

        // Retrieve the live item - episode to make sure we have the episode.id
        const liveItemWithId = await getLiveItemByGuid(liveItemNotificationData.episodeGuid, podcast.id)

        if (liveItemWithId?.episode?.id) {
          await sendLiveItemLiveDetectedNotification(
            liveItemNotificationData.podcastId,
            liveItemNotificationData.podcastTitle,
            liveItemNotificationData.episodeTitle,
            liveItemNotificationData.podcastImageUrl,
            liveItemNotificationData.episodeImageUrl,
            liveItemWithId?.episode?.id
          )
        } else {
          console.log('not found: liveItemWithId not found', liveItemNotificationData.episodeGuid, podcast.id)
        }
        logPerformance('sendLiveItemLiveDetectedNotification', _logEnd)
      }
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

const getMostRecentEpisodeDataFromFeed = (meta, episodes) => {
  const mostRecentEpisode = episodes.reduce((r: any, a: any) => {
    return new Date(r.pubDate) > new Date(a.pubDate) ? r : a
  }, [])
  const mostRecentEpisodeTitle = mostRecentEpisode && mostRecentEpisode.title
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

  return { mostRecentEpisodeTitle, mostRecentEpisodePubDate, mostRecentUpdateDateFromFeed }
}

const assignParsedEpisodeData = async (
  episode: ExtendedEpisode,
  parsedEpisode: ParsedEpisode,
  podcast,
  pvEpisodesValueTagsByGuid
) => {
  episode.isPublic = true

  episode.alternateEnclosures = parsedEpisode.alternateEnclosures
  if (parsedEpisode.chapters) {
    episode.chaptersUrl = parsedEpisode.chapters.url
    episode.chaptersType = parsedEpisode.chapters.type
  }
  episode.description = parsedEpisode.summary || parsedEpisode.description
  episode.duration = parsedEpisode.duration ? parseInt(parsedEpisode.duration, 10) : 0
  /* TODO: podcast-partytime is missing type and funding on episode */
  // episode.episodeType = parsedEpisode.type
  // episode.funding = parsedEpisode.funding
  episode.guid = parsedEpisode.guid || parsedEpisode.enclosure.url
  episode.imageUrl = parsedEpisode.imageURL
  episode.isExplicit = parsedEpisode.explicit
  episode.linkUrl = parsedEpisode.link

  episode.mediaType = parsedEpisode.enclosure.type
  episode.mediaUrl = parsedEpisode.enclosure.url

  const pubDate = new Date(parsedEpisode.pubDate)
  episode.pubDate = isValidDate(pubDate) ? pubDate : new Date()

  episode.socialInteraction = parsedEpisode.socialInteraction
  episode.soundbite = parsedEpisode.soundbite
  episode.subtitle = parsedEpisode.subtitle
  episode.title = parsedEpisode.title
  episode.transcript = parsedEpisode.transcript
  episode.value =
    parsedEpisode.value?.length > 0
      ? parsedEpisode.value
      : pvEpisodesValueTagsByGuid && parsedEpisode.guid && pvEpisodesValueTagsByGuid[parsedEpisode.guid]?.length > 0
      ? pvEpisodesValueTagsByGuid[parsedEpisode.guid]
      : []

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
    const liveItem = episode.liveItem || new LiveItem()
    liveItem.end = parsedEpisode.liveItemEnd || null
    liveItem.start = parsedEpisode.liveItemStart
    liveItem.status = parsedEpisode.liveItemStatus
    liveItem.chatIRCURL = parsedEpisode.chat
    episode.liveItem = liveItem

    // If a livestream has ended, set its episode to isPublic=false
    // so it doesn't get returned in requests anymore.
    if (liveItem.status === 'ended') {
      episode.isPublic = false
    }
  } else {
    episode.liveItem = null
  }

  return episode
}

const findOrGenerateParsedLiveItems = async (parsedLiveItems, podcast, pvEpisodesValueTagsByGuid) => {
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
    savedLiveItems = await getEpisodesWithLiveItemsWithMatchingGuids(podcast.id, parsedLiveItemGuids)
  }

  /*
    If liveItems exist in the database for this podcast,
    but they aren't currently in the feed, then retrieve
    and set them to isPublic = false
  */
  let liveItemsToHide = await getEpisodesWithLiveItemsWithoutMatchingGuids(podcast.id, parsedLiveItemGuids)

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
  // Preserve the previouslySavedLiveItems state since we will need it later
  // in the shouldSendLiveNotification check.
  const previouslySavedLiveItems = JSON.parse(JSON.stringify(savedLiveItems))
  for (let existingLiveItem of savedLiveItems) {
    const parsedLiveItem = validParsedLiveItems.find((x) => x.guid === existingLiveItem.guid)
    existingLiveItem = await assignParsedEpisodeData(
      existingLiveItem,
      parsedLiveItem,
      podcast,
      pvEpisodesValueTagsByGuid
    )

    if (parsedLiveItem.mediaType && checkIfVideoMediaType(parsedLiveItem.mediaType)) {
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
    episode = await assignParsedEpisodeData(episode, newParsedLiveItem, podcast, pvEpisodesValueTagsByGuid)

    if (newParsedLiveItem.mediaType && checkIfVideoMediaType(newParsedLiveItem.mediaType)) {
      videoCount++
    } else {
      audioCount++
    }

    if (!newLiveItems.some((x: any) => x.guid === episode.guid)) {
      newLiveItems.push(episode)
    }
  }

  const liveItemNotificationsData: LiveItemNotification[] = []

  for (const parsedLiveItem of parsedLiveItems) {
    const previouslyExistingLiveItem = previouslySavedLiveItems.find(
      (previouslySavedLiveItem) => parsedLiveItem.guid === previouslySavedLiveItem.guid
    )

    const shouldSendLiveNotification =
      parsedLiveItem.liveItemStatus === 'live' &&
      (!previouslyExistingLiveItem || previouslyExistingLiveItem.liveItem?.status !== 'live')

    const notificationLiveItem =
      previouslyExistingLiveItem || newLiveItems.find((newLiveItem) => parsedLiveItem.guid === newLiveItem.guid)

    if (shouldSendLiveNotification) {
      const finalPodcastImageUrl = podcast.shrunkImageUrl || podcast.imageUrl
      const finalEpisodeImageUrl = parsedLiveItem.imageURL

      liveItemNotificationsData.push({
        podcastId: podcast.id,
        podcastTitle: podcast.title,
        episodeTitle: parsedLiveItem.title,
        podcastImageUrl: finalPodcastImageUrl,
        episodeImageUrl: finalEpisodeImageUrl,
        episodeGuid: notificationLiveItem.guid
      })
    }
  }

  return {
    newLiveItems,
    updatedSavedLiveItems,
    hasVideo: videoCount > audioCount,
    liveItemNotificationsData
  }
}

const findOrGenerateParsedEpisodes = async (parsedEpisodes, podcast, pvEpisodesValueTagsByGuid) => {
  const episodeRepo = getRepository(Episode)

  // Parsed episodes are only valid if they have enclosure.url and guid tags,
  // so ignore all that do not.
  const validParsedEpisodes = parsedEpisodes.reduce((result, x) => {
    if (x.enclosure && x.enclosure.url && x.guid && !x.liveItemStart) result.push(x)
    return result
  }, [])

  // Create an array of only the episode guids from the parsed object
  const parsedEpisodeGuids = validParsedEpisodes.map((x) => x.guid)

  // Find episodes in the database that have matching episode media URLs AND podcast ids to
  // those found in the parsed object, then store an array of just those URLs.
  let savedEpisodes = [] as any
  if (parsedEpisodeGuids && parsedEpisodeGuids.length > 0) {
    savedEpisodes = await episodeRepo.find({
      where: {
        podcast,
        /*
          TODO: since duplicate GUIDs will exist in our system, we need to use
          isPublic: true so that previously hidden/dead episodes do not re-surface.
          If we remove all the duplicate GUID episodes in the database,
          then we could remove the isPublic: true condition. This *might* be desirable
          to handle edge cases, where episodes existed in a feed previously,
          then for some reason were removed, and then were added back into the feed.
        */
        isPublic: true,
        guid: In(parsedEpisodeGuids)
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
        guid: Not(In(parsedEpisodeGuids))
      }
    })

    const updatedEpisodesToHide = episodesToHide.map((x: ExtendedEpisode) => {
      x.isPublic = false
      return x
    })
    await episodeRepo.save(updatedEpisodesToHide, { chunk: 400 })
  }

  const savedEpisodeGuids = savedEpisodes.map((x) => x.guid)

  // Create an array of only the parsed episodes that do not have a match
  // already saved in the database.
  const newParsedEpisodes = validParsedEpisodes.filter((x) => !savedEpisodeGuids.includes(x.guid))

  const updatedSavedEpisodes = [] as any
  const newEpisodes = [] as any

  /* If a feed has more video episodes than audio episodes, mark it as a hasVideo podcast. */
  let videoCount = 0
  let audioCount = 0

  // If episode is already saved, then merge the matching episode found in
  // the parsed object with what is already saved.
  for (let existingEpisode of savedEpisodes) {
    const parsedEpisode = validParsedEpisodes.find((x) => x.guid === existingEpisode.guid)
    existingEpisode = await assignParsedEpisodeData(existingEpisode, parsedEpisode, podcast, pvEpisodesValueTagsByGuid)

    if (existingEpisode.mediaType && checkIfVideoMediaType(existingEpisode.mediaType)) {
      videoCount++
    } else {
      audioCount++
    }

    if (!updatedSavedEpisodes.some((x: any) => x.guid === existingEpisode.guid)) {
      updatedSavedEpisodes.push(existingEpisode)
    }
  }

  // If episode from the parsed object is new (not already saved),
  // then create a new episode.
  for (const newParsedEpisode of newParsedEpisodes) {
    let episode = new Episode() as ExtendedEpisode
    episode = await assignParsedEpisodeData(episode, newParsedEpisode, podcast, pvEpisodesValueTagsByGuid)

    if (newParsedEpisode.mediaType && checkIfVideoMediaType(newParsedEpisode.mediaType)) {
      videoCount++
    } else {
      audioCount++
    }

    if (!newEpisodes.some((x: any) => x.guid === episode.guid)) {
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
