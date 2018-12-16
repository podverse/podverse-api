import { hash } from 'bcryptjs'
import { getRepository } from 'typeorm'
import { User } from 'entities'
import { saltRounds } from 'lib/constants'
import { validateClassOrThrow } from 'lib/errors'
import { validatePassword } from 'lib/utility'
import { validateEmail } from 'lib/utility/validation';

const createError = require('http-errors')

const relations = ['playlists']

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

const getUser = async (id, options) => {
  const repository = getRepository(User)

  let user = await repository.findOne({ id }, {
    relations,
    ...options
  })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  // TODO: how can we use typeOrm queryBuilder so we don't need to sort playlists by title here?
  if (user && user.playlists) {
    user.playlists = user.playlists.sort((a, b) => {
      const textA = a.title && a.title.toUpperCase()
      const textB = b.title && b.title.toUpperCase()

      if (textA && textB) {
        return textA.localeCompare(textB)
      }

      return 0
    })
  }

  return user
}

const getUserByEmail = async (email) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ email }, { relations })

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
  const user = await repository.findOne({ resetPasswordToken }, { relations })

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
  const user = await repository.findOne({ emailVerificationToken }, { relations })

  if (!user) {
    throw new createError.NotFound('Invalid verify email token.')
  }

  return user
}

const getUsers = (query, options) => {
  const repository = getRepository(User)

  return repository.find({
    where: {
      ...query
    },
    relations,
    ...options
  })
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
  getUser,
  getUserByEmail,
  getUserByResetPasswordToken,
  getUserByVerificationToken,
  getUsers,
  updateQueueItems,
  updateUser,
  updateUserEmailVerificationToken,
  updateUserPassword,
  updateUserResetPasswordToken
}
