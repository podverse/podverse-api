import { getRepository } from 'typeorm'
import { Podcast, User } from '~/entities'
import { getQueryOrderColumn } from '~/lib/utility'
import { validateSearchQueryString } from '~/lib/utility/validation'
import { getUserSubscribedPodcastIds } from './user'

const createError = require('http-errors')

const getPodcast = async (id, includeRelations = true) => {
  const repository = getRepository(Podcast)
  const podcast = await repository.findOne(
    {
      id,
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

// Use where clause to reduce the size of very large data sets and speed up queries
const limitPodcastsQuerySize = (qb: any, podcastIds: any[], sort: string) => {
  if (!podcastIds || podcastIds.length === 0) {
    if (sort === 'top-past-hour') {
      qb.andWhere('podcast."pastHourTotalUniquePageviews" > 0')
    } else if (sort === 'top-past-day') {
      qb.andWhere('podcast."pastDayTotalUniquePageviews" > 0')
    } else if (sort === 'top-past-week') {
      qb.andWhere('podcast."pastWeekTotalUniquePageviews" > 0')
    } else if (sort === 'top-past-month') {
      qb.andWhere('podcast."pastMonthTotalUniquePageviews" > 0')
    } else if (sort === 'top-past-year') {
      qb.andWhere('podcast."pastYearTotalUniquePageviews" > 0')
    } else if (sort === 'top-all-time') {
      qb.andWhere('podcast."pastAllTimeTotalUniquePageviews" > 0')
    }
  }

  return qb
}

const getSubscribedPodcasts = async (query, loggedInUserId) => {
  const subscribedPodcastIds = await getUserSubscribedPodcastIds(loggedInUserId)
  query.podcastId = subscribedPodcastIds.join(',')
  return getPodcasts(query)
}

const getPodcasts = async (query) => {
  const repository = getRepository(Podcast)
  const { categories, includeAuthors, includeCategories, maxResults, podcastId, searchAuthor, searchTitle,
    skip, take } = query
  const podcastIds = (podcastId && podcastId.split(',')) || []

  let qb = repository
    .createQueryBuilder('podcast')
    .select('podcast.id')
    .addSelect('podcast.feedLastUpdated')
    .addSelect('podcast.funding')
    .addSelect('podcast.hideDynamicAdsWarning')
    .addSelect('podcast.imageUrl')
    .addSelect('podcast.isExplicit')
    .addSelect('podcast.lastEpisodePubDate')
    .addSelect('podcast.lastEpisodeTitle')
    .addSelect('podcast.linkUrl')
    .addSelect('podcast.pastHourTotalUniquePageviews')
    .addSelect('podcast.pastWeekTotalUniquePageviews')
    .addSelect('podcast.pastDayTotalUniquePageviews')
    .addSelect('podcast.pastMonthTotalUniquePageviews')
    .addSelect('podcast.pastYearTotalUniquePageviews')
    .addSelect('podcast.pastAllTimeTotalUniquePageviews')
    .addSelect('podcast.shrunkImageUrl')
    .addSelect('podcast.sortableTitle')
    .addSelect('podcast.title')
    .addSelect('podcast.value')
    .addSelect('podcast.createdAt')

  if (categories && categories.length > 0) {
    qb.innerJoinAndSelect(
      'podcast.categories',
      'categories',
      'categories.id = :id',
      { id: categories[0] }
    )
  } else {
    if (searchTitle) {
      const title = `%${searchTitle.toLowerCase().trim()}%`
      validateSearchQueryString(title)
      qb.where(
        'LOWER(podcast.title) LIKE :title',
        { title }
      )
    } else if (searchAuthor) {
      const name = `%${searchAuthor.toLowerCase().trim()}%`
      validateSearchQueryString(name)
      qb.innerJoinAndSelect(
        'podcast.authors',
        'authors',
        'LOWER(authors.name) LIKE :name',
        { name }
      )
      qb.innerJoinAndSelect('podcast.categories', 'categories')
    } else if (podcastId && podcastId.split(',').length > 0) {
      qb.where(
        'podcast.id IN (:...podcastIds)',
        { podcastIds }
      )
    }
  }

  if (includeAuthors && !searchTitle) {
    qb.leftJoinAndSelect('podcast.authors', 'authors')
  }

  if (includeCategories && !searchTitle) {
    qb.leftJoinAndSelect('podcast.categories', 'categories')
  }

  qb.andWhere('"isPublic" = true')

  qb = limitPodcastsQuerySize(qb, podcastIds, query.sort)

  const orderColumn = getQueryOrderColumn('podcast', query.sort, 'lastEpisodePubDate')
  
  query.sort === 'random' ? qb.orderBy(orderColumn[0]) : qb.orderBy(orderColumn[0], orderColumn[1] as any)

  try {
    const podcasts = await qb
      .offset(skip)
      .limit((maxResults && 1000) || take)
      .getManyAndCount()

    return podcasts
  } catch (error) {
    console.log(error)
    return
  }
}

const getMetadata = async query => {
  const repository = getRepository(Podcast)
  const { podcastId } = query

  if (!podcastId) {
    return []
  }

  const podcastIds = podcastId.split(',')

  const qb = repository
    .createQueryBuilder('podcast')
    .select('podcast.id')
    .addSelect('podcast.feedLastUpdated')
    .addSelect('podcast.funding')
    .addSelect('podcast.hideDynamicAdsWarning')
    .addSelect('podcast.lastEpisodePubDate')
    .addSelect('podcast.lastEpisodeTitle')
    .addSelect('podcast.sortableTitle')
    .addSelect('podcast.title')
    .addSelect('podcast.value')
    .where(
      'podcast.id IN (:...podcastIds)',
      { podcastIds }
    )
    .andWhere('"isPublic" = true')

  try {
    const podcasts = await qb
      .take(500)
      .getManyAndCount()

    return podcasts
  } catch (error) {
    console.log(error)
    return
  }
}

const toggleSubscribeToPodcast = async (podcastId, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this podcast')
  }

  const repository = getRepository(User)
  const user = await repository.findOne(
    {
      where: {
        id: loggedInUserId
      },
      select: [
        'id',
        'subscribedPodcastIds'
      ]
    }
  )

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  let subscribedPodcastIds = user.subscribedPodcastIds

  // If no podcastIds match the filter, add the podcastId.
  // Else, remove the podcastId.
  const filteredPodcasts = user.subscribedPodcastIds.filter(x => x !== podcastId)
  if (filteredPodcasts.length === user.subscribedPodcastIds.length) {
    subscribedPodcastIds.push(podcastId)
  } else {
    subscribedPodcastIds = filteredPodcasts
  }

  await repository.update(loggedInUserId, { subscribedPodcastIds })

  return subscribedPodcastIds
}

export {
  getPodcast,
  getPodcasts,
  getMetadata,
  getSubscribedPodcasts,
  toggleSubscribeToPodcast
}
