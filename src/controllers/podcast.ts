import { getRepository } from 'typeorm'
import { Podcast, User } from '~/entities'
import { getQueryOrderColumn } from '~/lib/utility'

const createError = require('http-errors')

const getPodcast = id => {
  const repository = getRepository(Podcast)
  const podcast = repository.findOne(
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
  const { categories, podcastId, searchAuthor, searchTitle, skip, take
    } = query

  let qb = repository
    .createQueryBuilder('podcast')
    .select('podcast.id')
    .addSelect('podcast.feedLastUpdated')
    .addSelect('podcast.imageUrl')
    .addSelect('podcast.isExplicit')
    .addSelect('podcast.lastEpisodePubDate')
    .addSelect('podcast.lastEpisodeTitle')
    .addSelect('podcast.linkUrl')
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
      const title = `%${searchTitle.toLowerCase()}%`
      qb.where(
        'LOWER(podcast.title) LIKE :title',
        { title }
      )
    } else if (searchAuthor) {
      const name = `%${searchAuthor.toLowerCase()}%`
      qb.innerJoinAndSelect(
        'podcast.authors',
        'author',
        'LOWER(author.name) LIKE :name',
        { name }
      )
    } else if (podcastId && podcastId.split(',').length > 0) {
      const podcastIds = podcastId.split(',')
      qb.where(
        'podcast.id IN (:...podcastIds)',
        { podcastIds }
      )
    }
  }

  if (!includeNSFW) {
    qb.andWhere('"isExplicit" = false')
  }

  qb.andWhere('"isPublic" = true')

  if (query.sort) {
    const orderColumn = getQueryOrderColumn('podcast', query.sort, 'lastEpisodePubDate')
    qb.orderBy(orderColumn, 'DESC')
  }

  try {
    const podcasts = await qb
      .skip(skip)
      .take(take)
      .getMany()

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
  let user = await repository.findOne(
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
  toggleSubscribeToPodcast
}
