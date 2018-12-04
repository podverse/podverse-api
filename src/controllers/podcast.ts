import { getRepository } from 'typeorm'
import { Podcast, User } from 'entities'
import { createQueryOrderObject } from 'lib/utility'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'episodes', 'feedUrls'
]

const getPodcast = (id) => {
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

const getPodcasts = async query => {
  const repository = getRepository(Podcast)

  const order = createQueryOrderObject(query.sort, 'createdAt')
  delete query.sort

  const skip = query.skip
  delete query.skip

  const take = query.take
  delete query.take

  // handle queries on a ManyToMany relationship with query builder
  // TODO: how can we allow filtering by multiple category ids?
  if (query.categories && query.categories.length > 0) {
    const podcasts = await repository
      .createQueryBuilder('podcast')
      .innerJoinAndSelect(
        'podcast.categories', 'category', 'category.id = :id',
        { id: query.categories[0] }
      )
      .where({ isPublic: true })
      .skip(skip)
      .take(take)
      .getMany()

    return podcasts
  } else {
    const podcasts = await repository.find({
      where: {
        ...query,
        isPublic: true
      },
      order,
      skip: parseInt(skip, 10),
      take: parseInt(take, 10),
      relations
    })

    return podcasts
  }
}

const toggleSubscribeToPodcast = async (podcastId, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this playlist')
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
