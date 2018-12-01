import { getRepository } from 'typeorm'
import { Podcast, User } from 'entities'
const createError = require('http-errors')

const relations = [
  'authors', 'categories', 'episodes', 'feedUrls'
]

const getPodcast = (id) => {
  const repository = getRepository(Podcast)
  const podcast = repository.findOne({
    id,
    isPublic: true
  }, { relations })

  if (!podcast) {
    throw new createError.NotFound('Podcast not found')
  }

  return podcast
}

const getPodcasts = (query, options) => {
  const repository = getRepository(Podcast)

  return repository.find({
    where: {
      ...query,
      isPublic: true
    },
    relations,
    ...options
  })
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
