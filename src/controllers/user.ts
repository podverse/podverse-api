import { hash } from 'bcryptjs'
import { getRepository } from 'typeorm'
import { MediaRef, Playlist, User } from '~/entities'
import { saltRounds } from '~/lib/constants'
import { validateClassOrThrow } from '~/lib/errors'
import { getQueryOrderColumn, validatePassword } from '~/lib/utility'
import { validateEmail } from '~/lib/utility/validation'
import { cleanNowPlayingItem } from '~/lib/utility/nowPlayingItem'

const createError = require('http-errors')

const addYearsToUserMembershipExpiration = async (id: string, years: number) => {
  const user = await getUser(id)
  if (user) {
    const { freeTrialExpiration } = user
    let { membershipExpiration } = user
    const currentDate = new Date()

    if (!membershipExpiration) {
      membershipExpiration = currentDate
    }

    if (freeTrialExpiration) {
      const freeTrialTimeRemaining = freeTrialExpiration.getTime() - currentDate.getTime()
      if (freeTrialTimeRemaining > 0) {
        membershipExpiration = new Date(membershipExpiration.getTime() + freeTrialTimeRemaining)
      }
    }

    // eslint-disable-next-line
    // @ts-ignore
    user.freeTrialExpiration = null
    const yearsInMilliseconds = years * 365 * 24 * 60 * 60 * 1000
    user.membershipExpiration = new Date(membershipExpiration.getTime() + yearsInMilliseconds)

    const repository = getRepository(User)
    await repository.update(user.id, user)

    return {
      id: user.id,
      membershipExpiration: user.membershipExpiration
    }
  } else {
    throw new createError.NotFound('User not found.')
  }
}

const getUser = async (id: string) => {
  const repository = getRepository(User)
  
  const user = await repository.findOne(
    { id },
    {
      relations: [],
      select: ['id', 'freeTrialExpiration', 'membershipExpiration']
    }
  )

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  return user
}

const createUser = async (obj) => {
  const repository = getRepository(User)
  const user = new User()
  const { password } = obj

  const isValidPassword = validatePassword(password)

  if (!isValidPassword) {
    throw new createError.BadRequest('Invalid password provided.')
  }

  const saltedPassword = await hash(password, saltRounds)

  obj.queueItems = Array.isArray(obj.queueItems) ? obj.queueItems : []
  obj.historyItems = Array.isArray(obj.historyItems) ? obj.historyItems : []
  obj.addByRSSPodcastFeedUrls = Array.isArray(obj.addByRSSPodcastFeedUrls) ? obj.addByRSSPodcastFeedUrls : []
  obj.subscribedPlaylistIds = Array.isArray(obj.subscribedPlaylistIds) ? obj.subscribedPlaylistIds : []
  obj.subscribedPodcastIds = Array.isArray(obj.subscribedPodcastIds) ? obj.subscribedPodcastIds : []
  obj.subscribedUserIds = Array.isArray(obj.subscribedUserIds) ? obj.subscribedUserIds : []

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

  const qb = repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.addByRSSPodcastFeedUrls')
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

  const qb = repository
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
  const userIds = query.userIds && query.userIds.split(',') || []

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
    
    .orderBy(orderColumn[0], orderColumn[1] as any)
    .getManyAndCount()

  return mediaRefs
}

const getUserPlaylists = async (query, ownerId) => {
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
  const loggedInUser = await repository.findOne(
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

  const userToSubscribe = await repository.findOne(
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
  if (!Array.isArray(queueItems)) {
    throw new createError.BadRequest('queueItems must be an array.')
  }

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to update this user')
  }

  const repository = getRepository(User)
  const user = await repository.findOne(
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
  
  if (!nowPlayingItem.episodeId && !nowPlayingItem.clipId) {
    throw new createError.BadRequest('An episodeId or clipId must be provided.')
  }

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to update history item playback position')
  }

  const repository = getRepository(User)
  const user = await repository.findOne(
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

  const historyItems = Array.isArray(user.historyItems) && user.historyItems || []

  const index = historyItems.findIndex(
    (x: any) => !x.clipId && x.episodeId === nowPlayingItem.episodeId)

  if (index === -1) {
    throw new createError.NotAcceptable('NowPlayingItem does not exist in historyItems yet. Send an addOrUpdatePlaybackItem request.')
  }

  if (index > -1) {
    historyItems[index].userPlaybackPosition = nowPlayingItem.userPlaybackPosition
    // Move item to beginning of historyItems
    if (historyItems.length > 1) {
      const itemToMoveArray = historyItems.splice(index, 1) as any
      if (itemToMoveArray.length > 0) {
        historyItems.unshift(itemToMoveArray[0])
      }
    }
  }

  return repository.update(loggedInUserId, { historyItems })
}

// NOTE: there seems to be a flaw with user.historyItems where it will stop updating the row,
// but it won't throw an error. I wonder if it is caused by invalid input a shows description?
// Maybe we need to change user.historyItems to use a new entity type, instead of a json column.
const addOrUpdateHistoryItem = async (uncleanedNowPlayingItem, loggedInUserId) => {

  // NOTE: If invalid fields are present on a historyItem,
  // it can cause numerous failures across every app!
  // Make sure only valid NowPlayingItems are saved to the user.historyItems JSON field
  // by cleaning them before adding/updating them in the historyItems
  const nowPlayingItem = cleanNowPlayingItem(uncleanedNowPlayingItem)

  if (!nowPlayingItem.episodeId && !nowPlayingItem.clipId) {
    throw new createError.BadRequest('An episodeId or clipId must be provided.')
  }

  if (nowPlayingItem.episodeDescription) {
    nowPlayingItem.episodeDescription = nowPlayingItem.episodeDescription.substring(0, 20000)
  }

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to add history items')
  }

  const repository = getRepository(User)
  const user = await repository.findOne(
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
    if (hasHistoryItemWithMatchingId(nowPlayingItem.episodeId, nowPlayingItem.clipId, x)) {
      nowPlayingItem.userPlaybackPosition = x.userPlaybackPosition || 0
      return
    } else {
      return x
    }
  })
  historyItems.unshift(nowPlayingItem)

  if (!Array.isArray(historyItems)) {
    throw new createError.BadRequest('historyItems must be an array.')
  }

  // NOTE: limiting the historyItems array here because the @beforeUpdate in user entity
  // will not be called on repository.update because historyItems uses select: false
  if (historyItems.length > 200) {
    const totalToRemove = (historyItems.length - 200)
    historyItems.splice(200, 200 + totalToRemove)
  }
  
  return repository.update(loggedInUserId, { historyItems })
}

const removeHistoryItem = async (episodeId, mediaRefId, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to remove history items')
  }

  const repository = getRepository(User)
  const user = await repository.findOne(
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

  if (!Array.isArray(historyItems)) {
    throw new createError.BadRequest('historyItems must be an array.')
  }

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
  const user = await repository.findOne(
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
        'addByRSSPodcastFeedUrls',
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

  if (user && user.historyItems && user.historyItems.length > 0) {
    const cleanedHistoryItems = [] as any
    for (const historyItem of user.historyItems) {
      delete historyItem.episodeDescription
      cleanedHistoryItems.push(historyItem)
    }
    user.historyItems = cleanedHistoryItems
  }

  return JSON.stringify(user)
}

const addByRSSPodcastFeedUrlAdd = async (url: string, loggedInUserId: string) => {
  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this profile.')
  }

  const repository = getRepository(User)
  const loggedInUser = await repository.findOne(
    {
      where: {
        id: loggedInUserId
      },
      select: [
        'id',
        'addByRSSPodcastFeedUrls'
      ]
    }
  )

  if (!loggedInUser) {
    throw new createError.NotFound('Logged In user not found')
  }

  const addByRSSPodcastFeedUrls = loggedInUser.addByRSSPodcastFeedUrls

  const filteredAddByRSSPodcastFeedUrls = loggedInUser.addByRSSPodcastFeedUrls.filter(x => x !== url)
  if (filteredAddByRSSPodcastFeedUrls.length === loggedInUser.addByRSSPodcastFeedUrls.length) {
    addByRSSPodcastFeedUrls.push(url)
  }

  await repository.update(loggedInUserId, { addByRSSPodcastFeedUrls })

  return addByRSSPodcastFeedUrls
}

const addByRSSPodcastFeedUrlRemove = async (url: string, loggedInUserId: string) => {
  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this profile.')
  }

  const repository = getRepository(User)
  const loggedInUser = await repository.findOne(
    {
      where: {
        id: loggedInUserId
      },
      select: [
        'id',
        'addByRSSPodcastFeedUrls'
      ]
    }
  )

  if (!loggedInUser) {
    throw new createError.NotFound('Logged In user not found')
  }

  let addByRSSPodcastFeedUrls = loggedInUser.addByRSSPodcastFeedUrls

  const filteredAddByRSSPodcastFeedUrls = loggedInUser.addByRSSPodcastFeedUrls.filter(x => x !== url)
  addByRSSPodcastFeedUrls = filteredAddByRSSPodcastFeedUrls

  await repository.update(loggedInUserId, { addByRSSPodcastFeedUrls })

  return addByRSSPodcastFeedUrls
}

export {
  addByRSSPodcastFeedUrlAdd,
  addByRSSPodcastFeedUrlRemove,
  addOrUpdateHistoryItem,
  addYearsToUserMembershipExpiration,
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
