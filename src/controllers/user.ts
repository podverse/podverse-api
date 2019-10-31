import { hash } from 'bcryptjs'
import { getRepository } from 'typeorm'
import { MediaRef, Playlist, User } from '~/entities'
import { saltRounds } from '~/lib/constants'
import { validateClassOrThrow } from '~/lib/errors'
import { getQueryOrderColumn, validatePassword } from '~/lib/utility'
import { validateEmail } from '~/lib/utility/validation'

const createError = require('http-errors')

const createUser = async (obj) => {
  const repository = getRepository(User)
  const user = new User()
  const { password } = obj

  const isValidPassword = validatePassword(password)

  if (!isValidPassword) {
    throw new createError.BadRequest('Invalid password provided.')
  }

  const saltedPassword = await hash(password, saltRounds)

  const newUser = Object.assign(user, obj, { password: saltedPassword })

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
  return newUser
}

const deleteLoggedInUser = async (id, loggedInUserId) => {

  if (id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this user')
  }

  const repository = getRepository(User)
  const user = await repository.findOne({ id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const result = await repository.remove(user)
  return result
}

const getLoggedInUser = async id => {
  const repository = getRepository(User)

  let qb = repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.email')
    .addSelect('user.emailVerified')
    .addSelect('user.freeTrialExpiration')
    .addSelect('user.historyItems')
    .addSelect('user.isPublic')
    .addSelect('user.membershipExpiration')
    .addSelect('user.name')
    .addSelect('user.queueItems')
    .addSelect('user.subscribedPlaylistIds')
    .addSelect('user.subscribedPodcastIds')
    .addSelect('user.subscribedUserIds')
    .leftJoinAndSelect(
      'user.playlists',
      'playlists',
      'playlists.owner = :ownerId',
      {
        ownerId: id
      }
    )
    .where('user.id = :id', { id })

  try {
    const user = await qb.getOne()

    if (!user) {
      throw new createError.NotFound('User not found.')
    }

    return user
  } catch (error) {
    console.log(error)
    return
  }
}

const getPublicUser = async id => {
  const repository = getRepository(User)

  let qb = repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.name')
    .addSelect('user.subscribedPodcastIds')
    .addSelect('user.isPublic')
    .where({ isPublic: true })
    .andWhere('user.id = :id', { id })

  const user = await qb.getOne()

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  return user
}

const getPublicUsers = async query => {
  const repository = getRepository(User)
  const { skip, take } = query
  let userIds = query.userIds && query.userIds.split(',') || []

  if (!userIds || userIds.length < 1) {
    return [[], 0]
  }

  const users = await repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.name')
    .where({
      isPublic: true
    })
    .andWhere('user.id IN (:...userIds)', { userIds })
    .skip(skip)
    .take(take)
    .orderBy('user.name', 'ASC')
    .getManyAndCount()

  return users
}

const getUserMediaRefs = async (query, ownerId, includeNSFW, includePrivate) => {
  const { skip, sort, take } = query
  const repository = getRepository(MediaRef)
  const orderColumn = getQueryOrderColumn('mediaRef', sort, 'createdAt')
  const episodeJoinAndSelect = `${includeNSFW ? 'true' : 'episode.isExplicit = :isExplicit'}`

  const mediaRefs = await repository
    .createQueryBuilder('mediaRef')
    .innerJoinAndSelect(
      'mediaRef.episode',
      'episode',
      episodeJoinAndSelect,
      {
        isExplicit: !!includeNSFW
      }
    )
    .innerJoinAndSelect('episode.podcast', 'podcast')
    .where(
      {
        ...(includePrivate ? {} : { isPublic: true }),
        owner: ownerId
      }
    )
    .skip(skip)
    .take(take)
    // @ts-ignore
    .orderBy(orderColumn[0], orderColumn[1])
    .getManyAndCount()

  return mediaRefs
}

const getUserPlaylists = async (query, ownerId, includePrivate) => {
  const { skip, take } = query
  const repository = getRepository(Playlist)

  const playlists = await repository
    .createQueryBuilder('playlist')
    .innerJoinAndSelect('playlist.owner', 'owner')
    .where(
      {
        // ...(includePrivate ? {} : { isPublic: true }),
        owner: ownerId
      }
    )
    .skip(skip)
    .take(take)
    .orderBy('playlist.title', 'ASC')
    .getManyAndCount()

  return playlists
}

const getUserByEmail = async (email) => {
  const repository = getRepository(User)
  const user = await repository.findOne({
    where: { email },
    select: [
      'emailVerified',
      'id',
      'name'
    ]
  })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  return user
}

const getUserByResetPasswordToken = async (resetPasswordToken) => {
  if (!resetPasswordToken) {
    throw new createError.BadRequest('Must provide a reset password token.')
  }

  const repository = getRepository(User)
  const user = await repository.findOne({ resetPasswordToken })

  if (!user) {
    throw new createError.BadRequest('Invalid password reset token.')
  }

  return user
}

const getUserByVerificationToken = async (emailVerificationToken) => {
  if (!emailVerificationToken) {
    throw new createError.BadRequest('Must provide an email verification token.')
  }

  const repository = getRepository(User)
  const user = await repository.findOne(
    {
      where: { emailVerificationToken },
      select: [
        'emailVerificationToken',
        'emailVerificationTokenExpiration',
        'emailVerified',
        'id'
      ]
    }
  )

  if (!user) {
    throw new createError.NotFound('Invalid verify email token.')
  }

  return user
}

const toggleSubscribeToUser = async (userId, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this profile.')
  }

  const repository = getRepository(User)
  let loggedInUser = await repository.findOne(
    {
      where: {
        id: loggedInUserId
      },
      select: [
        'id',
        'subscribedUserIds'
      ]
    }
  )

  if (!loggedInUser) {
    throw new createError.NotFound('Logged In user not found')
  }

  let userToSubscribe = await repository.findOne(
    {
      where: {
        id: userId
      },
      select: [
        'id',
        'subscribedUserIds'
      ]
    }
  )

  if (!userToSubscribe) {
    throw new createError.NotFound('User not found')
  }

  let subscribedUserIds = loggedInUser.subscribedUserIds

  // If no userIds match the filter, add the userId.
  // Else, remove the userId.
  const filteredUsers = loggedInUser.subscribedUserIds.filter(x => x !== userId)
  if (filteredUsers.length === loggedInUser.subscribedUserIds.length) {
    subscribedUserIds.push(userId)
  } else {
    subscribedUserIds = filteredUsers
  }

  await repository.update(loggedInUserId, { subscribedUserIds })

  return subscribedUserIds
}

const updateLoggedInUser = async (obj, loggedInUserId) => {

  if (!obj.id) {
    throw new createError.NotFound('Must provide a user id.')
  }

  if (obj.id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to update this user.')
  }

  if (obj.email && !validateEmail(obj.email)) {
    throw new createError.BadRequest('Please provide a valid email address.')
  }

  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const cleanedObj = {
    ...(obj.email ? { email: obj.email } : {}),
    ...(obj.isPublic || obj.isPublic === false ? { isPublic: obj.isPublic } : {}),
    ...(obj.name || obj.name === '' ? { name: obj.name } : {})
  }

  await repository.update(obj.id, cleanedObj)

  return {
    email: obj.email,
    id: obj.id,
    isPublic: obj.isPublic,
    name: obj.name
  }
}

const updateUserEmailVerificationToken = async obj => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const cleanedObj = {
    emailVerified: obj.emailVerified,
    emailVerificationToken: obj.emailVerificationToken,
    emailVerificationTokenExpiration: obj.emailVerificationTokenExpiration
  }

  await repository.update(obj.id, cleanedObj)

  return
}

const updateUserPassword = async obj => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const { password, resetPasswordToken, resetPasswordTokenExpiration } = obj

  if (!password) {
    throw new createError.BadRequest('Must provide a new password.')
  } else if (password && !validatePassword(password)) {
    throw new createError.BadRequest('Invalid password provided.')
  }

  const saltedPassword = await hash(password, saltRounds)

  const cleanedObj = {
    password: saltedPassword,
    resetPasswordToken,
    resetPasswordTokenExpiration
  }

  const newUser = Object.assign(user, cleanedObj)

  await repository.update(obj.id, cleanedObj)

  return newUser
}

const updateUserResetPasswordToken = async (obj) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const cleanedObj = {
    resetPasswordToken: obj.resetPasswordToken,
    resetPasswordTokenExpiration: obj.resetPasswordTokenExpiration
  }

  const newUser = Object.assign(user, cleanedObj)

  await repository.update(obj.id, cleanedObj)

  return newUser
}

const updateQueueItems = async (queueItems, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to update this user')
  }

  const repository = getRepository(User)
  let user = await repository.findOne(
    {
      id: loggedInUserId
    },
    {
      select: [
        'id',
        'queueItems'
      ]
    })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  await repository.update(loggedInUserId, { queueItems })

  return { queueItems }
}

const updateHistoryItemPlaybackPosition = async (nowPlayingItem, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to update history item playback position')
  }

  const repository = getRepository(User)
  let user = await repository.findOne(
    {
      id: loggedInUserId
    },
    {
      select: [
        'id',
        'historyItems'
      ]
    })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  let historyItems = Array.isArray(user.historyItems) && user.historyItems || []

  const index = historyItems.findIndex(
    (x: any) => !x.clipId && x.episodeId === nowPlayingItem.episodeId)

  if (index > -1) {
    historyItems[index].userPlaybackPosition = nowPlayingItem.userPlaybackPosition
  }

  return repository.update(loggedInUserId, { historyItems })
}

const addOrUpdateHistoryItem = async (nowPlayingItem, loggedInUserId) => {
  if (nowPlayingItem.episodeDescription) {
    nowPlayingItem.episodeDescription = nowPlayingItem.episodeDescription.substring(0, 20000)
  }

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to add history items')
  }

  const repository = getRepository(User)
  let user = await repository.findOne(
    {
      id: loggedInUserId
    },
    {
      select: [
        'id',
        'historyItems'
      ]
    })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  let historyItems = Array.isArray(user.historyItems) && user.historyItems || []

  // NOTE: userPlaybackPosition should ONLY ever be updated in updateHistoryItemPlaybackPosition.
  // Remove historyItem if it already exists in the array, but retain the stored userPlaybackPosition,
  // then prepend it to the array.
  historyItems = historyItems.filter(x => {
    if (x.episodeDescription) {
      x.episodeDescription = x.episodeDescription.substring(0, 20000)
    }
    if (hasHistoryItemWithMatchingId(nowPlayingItem.episodeId, nowPlayingItem.clipId, x)) {
      nowPlayingItem.userPlaybackPosition = x.userPlaybackPosition || 0
      return
    } else {
      return x
    }
  })
  historyItems.unshift(nowPlayingItem)

  return repository.update(loggedInUserId, { historyItems })
}

const removeHistoryItem = async (episodeId, mediaRefId, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to remove history items')
  }

  const repository = getRepository(User)
  let user = await repository.findOne(
    {
      id: loggedInUserId
    },
    {
      select: [
        'id',
        'historyItems'
      ]
    }
  )

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  let historyItems = Array.isArray(user.historyItems) && user.historyItems || []

  const hasMatchingHistoryItem = historyItems.some(x => hasHistoryItemWithMatchingId(episodeId, mediaRefId, x))

  if (!hasMatchingHistoryItem) {
    throw new createError.NotFound('History item not found.')
  }

  historyItems = historyItems.filter(x => {
    if (hasHistoryItemWithMatchingId(episodeId, mediaRefId, x)) {
      return
    } else {
      return x
    }
  })

  return repository.update(loggedInUserId, { historyItems })
}

const hasHistoryItemWithMatchingId = (episodeId: string, mediaRefId: string, item: any) => {
  if (mediaRefId && item.clipId === mediaRefId) {
    return true
  } else if (!mediaRefId && !item.clipId && item.episodeId === episodeId) {
    return true
  } else {
    return false
  }
}

const clearAllHistoryItems = async (loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to remove history items')
  }

  const repository = getRepository(User)
  let user = await repository.findOne(
    {
      id: loggedInUserId
    },
    {
      select: ['id']
    }
  )

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  return repository.update(loggedInUserId, { historyItems: [] })
}

const getCompleteUserDataAsJSON = async (id, loggedInUserId) => {

  if (id !== loggedInUserId) {
    throw new createError.Unauthorized(`Unauthorized error. Please check that you are logged in.`)
  }
  const userRepository = getRepository(User)

  const user = await userRepository.findOne(
    {
      id: loggedInUserId
    },
    {
      select: [
        'id',
        'email',
        'historyItems',
        'name',
        'subscribedPlaylistIds',
        'subscribedPodcastIds',
        'subscribedUserIds'
      ],
      relations: ['mediaRefs', 'playlists']
    }
  )

  return JSON.stringify(user)
}

export {
  addOrUpdateHistoryItem,
  clearAllHistoryItems,
  createUser,
  deleteLoggedInUser,
  getCompleteUserDataAsJSON,
  getLoggedInUser,
  getPublicUser,
  getPublicUsers,
  getUserByEmail,
  getUserByResetPasswordToken,
  getUserByVerificationToken,
  getUserMediaRefs,
  getUserPlaylists,
  removeHistoryItem,
  toggleSubscribeToUser,
  updateHistoryItemPlaybackPosition,
  updateQueueItems,
  updateLoggedInUser,
  updateUserEmailVerificationToken,
  updateUserPassword,
  updateUserResetPasswordToken
}
