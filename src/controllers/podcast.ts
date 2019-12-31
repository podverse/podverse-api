import { getRepository } from 'typeorm'
import { Podcast, User } from '~/entities'
import { getQueryOrderColumn } from '~/lib/utility'

const createError = require('http-errors')

const getPodcast = async id => {
  const repository = getRepository(Podcast)
  const podcast = await repository.findOne(
    {
      id,
      isPublic: true
    },
    {
      relations: ['authors', 'categories', 'feedUrls']
    }
  )

  if (!podcast) {
    throw new createError.NotFound('Podcast not found')
  }

  return podcast
}

const getPodcasts = async (query, includeNSFW) => {
  const repository = getRepository(Podcast)
  const { categories, includeAuthors, includeCategories, maxResults, podcastId, searchAuthor, searchTitle,
    skip, take } = query

  const qb = repository
    .createQueryBuilder('podcast')
    .select('podcast.id')
    .addSelect('podcast.feedLastUpdated')
    .addSelect('podcast.imageUrl')
    .addSelect('podcast.isExplicit')
    .addSelect('podcast.lastEpisodePubDate')
    .addSelect('podcast.lastEpisodeTitle')
    .addSelect('podcast.linkUrl')
    .addSelect('podcast.shrunkImageUrlPath')
    .addSelect('podcast.sortableTitle')
    .addSelect('podcast.title')
    .addSelect('podcast.pastHourTotalUniquePageviews')
    .addSelect('podcast.pastWeekTotalUniquePageviews')
    .addSelect('podcast.pastDayTotalUniquePageviews')
    .addSelect('podcast.pastMonthTotalUniquePageviews')
    .addSelect('podcast.pastYearTotalUniquePageviews')
    .addSelect('podcast.pastAllTimeTotalUniquePageviews')
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
      qb.where(
        'LOWER(podcast.title) LIKE :title',
        { title }
      )
      qb.leftJoinAndSelect('podcast.authors', 'authors')
      qb.leftJoinAndSelect('podcast.categories', 'categories')
    } else if (searchAuthor) {
      const name = `%${searchAuthor.toLowerCase().trim()}%`
      qb.innerJoinAndSelect(
        'podcast.authors',
        'authors',
        'LOWER(authors.name) LIKE :name',
        { name }
      )
      qb.innerJoinAndSelect('podcast.categories', 'categories')
    } else if (podcastId && podcastId.split(',').length > 0) {
      const podcastIds = podcastId.split(',')
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

  if (!includeNSFW) {
    qb.andWhere('"isExplicit" = false')
  }

  qb.andWhere('"isPublic" = true')

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
    .addSelect('podcast.lastEpisodePubDate')
    .addSelect('podcast.lastEpisodeTitle')
    .addSelect('podcast.sortableTitle')
    .addSelect('podcast.title')
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
  toggleSubscribeToPodcast
}
