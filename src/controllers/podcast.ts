import { getRepository, In } from 'typeorm'
import { getUserSubscribedPodcastIds } from '~/controllers/user'
import { FeedUrl, Podcast, User } from '~/entities'
import { addOrderByToQuery, getManticoreOrderByColumnName, removeAllSpaces } from '~/lib/utility'
import { validateSearchQueryString } from '~/lib/utility/validation'
import { manticoreWildcardSpecialCharacters, searchApi } from '~/services/manticore'
import { deleteNotification } from './notification'
const createError = require('http-errors')
const SqlString = require('sqlstring')

const getPodcast = async (id, includeRelations = true, allowNonPublic?: boolean) => {
  const repository = getRepository(Podcast)
  const podcast = await repository.findOne(
    {
      id,
      ...(!!allowNonPublic ? {} : { isPublic: true })
    },
    {
      relations: includeRelations ? ['authors', 'categories', 'feedUrls'] : []
    }
  )

  if (!podcast) {
    throw new createError.NotFound('Podcast not found')
  }

  return podcast
}

const getPodcastByPodcastIndexId = async (podcastIndexId, includeRelations = true, allowNonPublic?: boolean) => {
  const repository = getRepository(Podcast)
  const podcast = await repository.findOne(
    {
      podcastIndexId,
      ...(!!allowNonPublic ? {} : { isPublic: true })
    },
    {
      relations: includeRelations ? ['authors', 'categories', 'feedUrls'] : []
    }
  )

  if (!podcast) {
    throw new createError.NotFound('Podcast not found')
  }

  return podcast
}

const getPodcastByPodcastGuid = async (podcastGuid: string, includeRelations?: boolean) => {
  const repository = getRepository(Podcast)
  const podcast = await repository.findOne(
    {
      podcastGuid,
      isPublic: true
    },
    {
      relations: includeRelations ? ['authors', 'categories', 'feedUrls'] : []
    }
  )

  if (!podcast) {
    throw new createError.NotFound('Podcast not found')
  }

  return podcast
}

const getPodcastByFeedUrl = async (feedUrl: string, includeRelations?: boolean) => {
  const podcastId = await getPodcastIdByFeedUrl(feedUrl)
  const repository = getRepository(Podcast)
  const podcast = await repository.findOne(
    {
      id: podcastId,
      isPublic: true
    },
    {
      relations: includeRelations ? ['authors', 'categories', 'feedUrls'] : []
    }
  )

  if (!podcast) {
    throw new createError.NotFound('Podcast not found')
  }

  return podcast
}

const findPodcastsByFeedUrls = async (urls: string[]) => {
  const foundPodcastIds = [] as any
  const notFoundFeedUrls = [] as any

  // Limit to 2000 to prevent DOS'ing
  const limitedArray = urls.slice(0, 2000)
  for (const url of limitedArray) {
    const podcastId = await getPodcastIdByFeedUrl(url)
    if (podcastId) {
      foundPodcastIds.push(podcastId)
    } else {
      notFoundFeedUrls.push(url)
    }
  }

  return {
    foundPodcastIds,
    notFoundFeedUrls
  }
}

const getPodcastIdByFeedUrl = async (url: string) => {
  const repository = getRepository(FeedUrl)
  const feedUrl = await repository
    .createQueryBuilder('feedUrl')
    .select('feedUrl.url')
    .innerJoinAndSelect('feedUrl.podcast', 'podcast')
    .where('feedUrl.url = :url', { url })
    .getOne()

  if (!feedUrl || !feedUrl.podcast) return

  return feedUrl.podcast.id
}

const getSubscribedPodcasts = async (query, loggedInUserId) => {
  const subscribedPodcastIds = await getUserSubscribedPodcastIds(loggedInUserId)
  query.podcastId = subscribedPodcastIds.join(',')

  let podcasts
  if (query.searchTitle) {
    podcasts = await getPodcastsFromSearchEngine(query)
  } else {
    podcasts = await getPodcasts(query)
  }
  return podcasts
}

const getPodcastsFromSearchEngine = async (query) => {
  const { searchTitle, skip, sort, take } = query

  const { orderByColumnName, orderByDirection } = getManticoreOrderByColumnName(sort)
  const cleanedSearchTitle = removeAllSpaces(searchTitle)
  if (!cleanedSearchTitle) throw new Error('Must provide a searchTitle.')
  const titleWithWildcards = manticoreWildcardSpecialCharacters(cleanedSearchTitle)

  const safeSqlString = SqlString.format(
    `
      SELECT *
      FROM idx_podcast
      WHERE match(?)
      ORDER BY weight() DESC, ${orderByColumnName} ${orderByDirection}
      LIMIT ?,?;
  `,
    [titleWithWildcards, skip, take]
  )

  const result = await searchApi.sql(safeSqlString)

  let podcastIds = [] as any[]
  const { data, total } = result

  if (Array.isArray(data)) {
    podcastIds = data.map((x: any) => x.podverse_id)
  } else {
    return [[], 0]
  }

  const podcastIdsString = podcastIds.join(',')
  if (!podcastIdsString) return [data, total]

  delete query.searchTitle
  delete query.skip
  query.podcastId = podcastIdsString

  const isFromManticoreSearch = true
  return getPodcasts(query, total, isFromManticoreSearch)
}

const getPodcasts = async (query, countOverride?, isFromManticoreSearch?) => {
  const repository = getRepository(Podcast)
  const {
    categories,
    hasVideo,
    includeAuthors,
    includeCategories,
    maxResults,
    podcastId,
    searchAuthor,
    skip,
    sort,
    take
  } = query
  const podcastIds = (podcastId && podcastId.split(',')) || []

  let qb = repository
    .createQueryBuilder('podcast')
    .select('podcast.id')
    .addSelect('podcast.podcastIndexId')
    .addSelect('podcast.credentialsRequired')
    .addSelect('podcast.description')
    .addSelect('podcast.feedLastUpdated')
    .addSelect('podcast.funding')
    .addSelect('podcast.hasLiveItem')
    .addSelect('podcast.hasVideo')
    .addSelect('podcast.hideDynamicAdsWarning')
    .addSelect('podcast.imageUrl')
    .addSelect('podcast.isExplicit')
    .addSelect('podcast.lastEpisodePubDate')
    .addSelect('podcast.lastEpisodeTitle')
    .addSelect('podcast.lastFoundInPodcastIndex')
    .addSelect('podcast.latestLiveItemStatus')
    .addSelect('podcast.linkUrl')
    .addSelect('podcast.medium')
    .addSelect('podcast.pastHourTotalUniquePageviews')
    .addSelect('podcast.pastWeekTotalUniquePageviews')
    .addSelect('podcast.pastDayTotalUniquePageviews')
    .addSelect('podcast.pastMonthTotalUniquePageviews')
    .addSelect('podcast.pastYearTotalUniquePageviews')
    .addSelect('podcast.pastAllTimeTotalUniquePageviews')
    .addSelect('podcast.shrunkImageUrl')
    .addSelect('podcast.sortableTitle')
    .addSelect('podcast.subtitle')
    .addSelect('podcast.title')
    .addSelect('podcast.value')
    .addSelect('podcast.createdAt')
    .addSelect('feedUrls.url')
    .innerJoin('podcast.feedUrls', 'feedUrls', 'feedUrls.isAuthority = :isAuthority', { isAuthority: true })

  if (categories && categories.length > 0) {
    qb.innerJoinAndSelect('podcast.categories', 'categories', 'categories.id = :id', { id: categories[0] })
  } else {
    if (searchAuthor) {
      const name = `%${searchAuthor.toLowerCase().trim()}%`
      validateSearchQueryString(name)
      qb.innerJoinAndSelect('podcast.authors', 'authors', 'LOWER(authors.name) LIKE :name', { name })
      qb.innerJoinAndSelect('podcast.categories', 'categories')
    } else if (podcastIds.length) {
      qb.where('podcast.id IN (:...podcastIds)', { podcastIds })
    }
  }

  if (includeAuthors) {
    qb.leftJoinAndSelect('podcast.authors', 'authors')
  }

  if (includeCategories) {
    qb.leftJoinAndSelect('podcast.categories', 'categories')
  }

  qb.andWhere('"isPublic" = true')
  if (hasVideo) {
    qb.andWhere('podcast."hasVideo" IS true')
  }

  const allowRandom = !!podcastIds
  qb = addOrderByToQuery(qb, 'podcast', sort, 'lastEpisodePubDate', allowRandom, isFromManticoreSearch)

  try {
    let podcastResults
    let podcasts
    let podcastsCount

    if (categories?.length > 0 || podcastIds.length === 0) {
      podcastResults = await qb.offset(skip).limit(20).getMany()
      podcasts = podcastResults
      podcastsCount = 10000
    } else {
      podcastResults = await qb
        .offset(skip)
        .limit((maxResults && 1000) || take)
        .getManyAndCount()
      podcasts = podcastResults[0]
      podcastsCount = podcastResults[1]
    }

    const finalPodcastResults = [] as any

    if (podcastIds && podcastIds.length && isFromManticoreSearch) {
      podcasts.sort(function (p1, p2) {
        return podcastIds.indexOf(p1.id) - podcastIds.indexOf(p2.id)
      })
    }

    if (countOverride > 0) {
      podcastsCount = countOverride
    }

    finalPodcastResults.push(podcasts)
    finalPodcastResults.push(podcastsCount)

    return finalPodcastResults
  } catch (error) {
    console.log(error)
    return
  }
}

const getMetadata = async (query) => {
  const repository = getRepository(Podcast)
  const { podcastId } = query

  if (!podcastId) {
    return []
  }

  const podcastIds = podcastId.split(',')

  const qb = repository
    .createQueryBuilder('podcast')
    .select('podcast.id')
    .addSelect('podcast.credentialsRequired')
    .addSelect('podcast.feedLastUpdated')
    .addSelect('podcast.funding')
    .addSelect('podcast.hasLiveItem')
    .addSelect('podcast.hasVideo')
    .addSelect('podcast.hideDynamicAdsWarning')
    .addSelect('podcast.lastEpisodePubDate')
    .addSelect('podcast.lastEpisodeTitle')
    .addSelect('podcast.latestLiveItemStatus')
    .addSelect('podcast.medium')
    .addSelect('podcast.sortableTitle')
    .addSelect('podcast.subtitle')
    .addSelect('podcast.title')
    .addSelect('podcast.value')
    .where('podcast.id IN (:...podcastIds)', { podcastIds })
    .andWhere('"isPublic" = true')

  try {
    const podcasts = await qb.take(500).getManyAndCount()

    return podcasts
  } catch (error) {
    console.log(error)
    return
  }
}

const getSubscribedPodcastIds = async (loggedInUserId) => {
  const repository = getRepository(User)
  const user = await repository.findOne({
    where: {
      id: loggedInUserId
    },
    select: ['id', 'subscribedPodcastIds']
  })

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  return user.subscribedPodcastIds
}

const toggleSubscribeToPodcast = async (podcastId, loggedInUserId) => {
  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this podcast')
  }

  const repository = getRepository(User)
  let subscribedPodcastIds = await getSubscribedPodcastIds(loggedInUserId)

  // If no podcastIds match the filter, add the podcastId.
  // Else, remove the podcastId.
  const filteredPodcasts = subscribedPodcastIds.filter((x) => x !== podcastId)
  const shouldSubscribe = filteredPodcasts.length === subscribedPodcastIds.length

  if (shouldSubscribe) {
    subscribedPodcastIds.push(podcastId)
  } else {
    subscribedPodcastIds = filteredPodcasts
  }

  await repository.update(loggedInUserId, { subscribedPodcastIds })

  if (!shouldSubscribe) {
    try {
      await deleteNotification(podcastId, loggedInUserId)
    } catch (error) {
      //
    }
  }

  return subscribedPodcastIds
}

const subscribeToPodcast = async (podcastId, loggedInUserId) => {
  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this podcast')
  }

  const repository = getRepository(User)
  const user = await repository.findOne({
    where: {
      id: loggedInUserId
    },
    select: ['id', 'subscribedPodcastIds']
  })

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  const subscribedPodcastIds = user.subscribedPodcastIds

  // If no podcastIds match the filter, add the podcastId.
  // Else, do nothing
  const filteredPodcasts = user.subscribedPodcastIds.filter((x) => x !== podcastId)
  if (filteredPodcasts.length === user.subscribedPodcastIds.length) {
    subscribedPodcastIds.push(podcastId)
    await repository.update(loggedInUserId, { subscribedPodcastIds })
  }

  return subscribedPodcastIds
}

const updateHasPodcastIndexValueTags = async (podcastIndexIds: string[]) => {
  console.log('updateHasPodcastIndexValueTags', podcastIndexIds.length)
  const repository = getRepository(Podcast)

  // First reset all the podcasts with hasPodcastIndexValueTag=true already to false.
  const podcastsToResetValueTag = await repository.find({
    where: {
      hasPodcastIndexValueTag: true
    }
  })
  const newPodcastsToReset = podcastsToResetValueTag.map((podcast) => {
    podcast.hasPodcastIndexValueTag = false
    return podcast
  })

  console.log('newPodcastsToReset', newPodcastsToReset.length)
  await repository.save(newPodcastsToReset, { chunk: 400 })

  const podcastsToUpdate = await repository.find({
    where: {
      podcastIndexId: In(podcastIndexIds)
    }
  })

  const newPodcastsToUpdate = podcastsToUpdate.map((podcast) => {
    podcast.hasPodcastIndexValueTag = true
    return podcast
  })

  console.log('newPodcastsToUpdate', newPodcastsToUpdate.length)
  await repository.save(newPodcastsToUpdate, { chunk: 400 })
  console.log('newPodcastsToUpdate finished')
}

export {
  findPodcastsByFeedUrls,
  getPodcast,
  getPodcasts,
  getPodcastByFeedUrl,
  getPodcastByPodcastGuid,
  getPodcastByPodcastIndexId,
  getPodcastsFromSearchEngine,
  getMetadata,
  getSubscribedPodcasts,
  subscribeToPodcast,
  toggleSubscribeToPodcast,
  updateHasPodcastIndexValueTags
}
