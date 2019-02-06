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

  if (query.categories && query.categories.length > 0) {
    qb.innerJoinAndSelect(
      'podcast.categories',
      'categories',
      'categories.id = :id',
      { id: query.categories[0] }
    )
  } else {
    if (query.searchTitle) {
      const title = `%${query.searchTitle.toLowerCase()}%`
      qb.where(
        'LOWER(podcast.title) LIKE :title',
        { title }
      )
    } else if (query.searchAuthor) {
      const name = `%${query.searchAuthor.toLowerCase()}%`
      qb.innerJoinAndSelect(
        'podcast.authors',
        'author',
        'LOWER(author.name) LIKE :name',
        { name }
      )
    } else if (query.podcastId && query.podcastId.split(',').length > 0) {
      const podcastIds = query.podcastId.split(',')
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
    const orderColumn = getQueryOrderColumn('podcast', query.sort, 'createdAt')
    qb.orderBy(orderColumn, 'ASC')
  }

  try {
    const podcasts = await qb
      .skip(query.skip)
      .take(2)
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

  // If no podcastIds match the filter, add the podcastId.
  // Else, remove the podcastId.
  const filteredPodcasts = user.subscribedPodcastIds.filter(x => x !== podcastId)
  if (filteredPodcasts.length === user.subscribedPodcastIds.length) {
    user.subscribedPodcastIds.push(podcastId)
  } else {
    user.subscribedPodcastIds = filteredPodcasts
  }

  const updatedUser = await repository.save(user)

  return updatedUser.subscribedPodcastIds
}

export {
  getPodcast,
  getPodcasts,
  toggleSubscribeToPodcast
}
