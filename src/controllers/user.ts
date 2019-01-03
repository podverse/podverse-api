import { hash } from 'bcryptjs'
import { getRepository } from 'typeorm'
import { User } from 'entities'
import { saltRounds } from 'lib/constants'
import { validateClassOrThrow } from 'lib/errors'
import { validatePassword } from 'lib/utility'
import { validateEmail } from 'lib/utility/validation';

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

const deleteUser = async (id, loggedInUserId) => {

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

const getPublicUser = async (id, includeMediaRefs, includePlaylists) => {
  const repository = getRepository(User)

  let qb = repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.name')
    .where('user.id = :id', { id: 'WLZduWLY7P' })

  if (includeMediaRefs) {
    qb.leftJoinAndMapMany(
      'user.mediaRefs',
      'user.mediaRefs',
      'mediaRef',
      '"mediaRef"."ownerId" = user.id AND "mediaRef"."isPublic" = true'
    )
  }

  if (includePlaylists) {
    qb.leftJoinAndMapMany(
      'user.playlists',
      'user.playlists',
      'playlist',
      '"playlist"."ownerId" = user.id AND "playlist"."isPublic" = true'
    )
  }

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

const getLoggedInUser = async (id, includeMediaRefs, includePlaylists) => {
  const repository = getRepository(User)

  let qb = repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.email')
    .addSelect('user.emailVerified')
    .addSelect('user.freeTrialExpiration')
    .addSelect('user.isPublic')
    .addSelect('user.membershipExpiration')
    .addSelect('user.name')
    .addSelect('user.subscribedPlaylistIds')
    .addSelect('user.historyItems')
    .addSelect('user.queueItems')
    .where('user.id = :id', { id: 'WLZduWLY7P' })

  if (includeMediaRefs) {
    qb.leftJoinAndMapMany(
      'user.mediaRefs',
      'user.mediaRefs',
      'mediaRef',
      '"mediaRef"."ownerId" = user.id'
    )
  }

  if (includePlaylists) {
    qb.leftJoinAndMapMany(
      'user.playlists',
      'user.playlists',
      'playlist',
      '"playlist"."ownerId" = user.id'
    )
  }

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

const getUserByEmail = async (email) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ email })

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
    throw new createError.NotFound('Invalid password reset token.')
  }

  return user
}

const getUserByVerificationToken = async (emailVerificationToken) => {
  if (!emailVerificationToken) {
    throw new createError.BadRequest('Must provide an email verification token.')
  }

  const repository = getRepository(User)
  const user = await repository.findOne({ emailVerificationToken })

  if (!user) {
    throw new createError.NotFound('Invalid verify email token.')
  }

  return user
}

const updateUser = async (obj, loggedInUserId) => {

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
    ...(obj.name || obj.name === '' ? { name: obj.name } : {})
  }

  await repository.update(obj.id, cleanedObj)

  return {
    email: obj.email,
    id: obj.id,
    name: obj.name
  }
}

const updateUserEmailVerificationToken = async (obj) => {
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

  const newUser = Object.assign(user, cleanedObj)

  await validateClassOrThrow(newUser)

  await repository.update(obj.id, cleanedObj)

  return newUser
}

const updateUserPassword = async (obj) => {
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

  await validateClassOrThrow(newUser)

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

  await validateClassOrThrow(newUser)

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

const addOrUpdateHistoryItem = async (nowPlayingItem, loggedInUserId) => {

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

  let historyItems = user.historyItems || []

  // Remove historyItem if it already exists in the array, then append it to the end.
  historyItems = historyItems.filter(x => {
    if (x) {
      if (x.clipId && nowPlayingItem.clipId && x.clipId !== nowPlayingItem.clipId) {
        return x
      } else if (x.episodeId !== nowPlayingItem.episodeId) {
        return x
      }
    }

    return
  })
  historyItems.push(nowPlayingItem)

  return repository.update(loggedInUserId, { historyItems })
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
        'name',
        'subscribedPlaylistIds',
        'subscribedPodcastIds',
        'historyItems'
      ],
      relations: ['mediaRefs', 'playlists']
    }
  )

  return JSON.stringify(user)
}

export {
  addOrUpdateHistoryItem,
  createUser,
  deleteUser,
  getCompleteUserDataAsJSON,
  getLoggedInUser,
  getPublicUser,
  getUserByEmail,
  getUserByResetPasswordToken,
  getUserByVerificationToken,
  updateQueueItems,
  updateUser,
  updateUserEmailVerificationToken,
  updateUserPassword,
  updateUserResetPasswordToken
}
