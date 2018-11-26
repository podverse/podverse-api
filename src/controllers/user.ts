import { getRepository } from 'typeorm'
import { User } from 'entities'
import { validateClassOrThrow } from 'lib/errors'
import { validatePassword } from 'lib/utility'

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

  const newUser = Object.assign(user, obj, { password })

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
  return newUser
}

const deleteUser = async (id, loggedInUserId) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  if (id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this user')
  }

  const result = await repository.remove(user)
  return result
}

const getUser = async (id, options) => {
  const repository = getRepository(User)

  const user = await repository.findOne({ id }, { 
    relations,
    ...options
  })

  if (!user) {
    throw new createError.NotFound('User not found.')
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
    throw new createError.NotFound('User not found or invalid token.')
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
    throw new createError.NotFound('User not found or invalid token.')
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
  const repository = getRepository(User)
  const { id } = obj
  const user = await repository.findOne({ id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  if (id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to update this user')
  }

  delete obj.password
  delete obj.resetPasswordToken
  delete obj.resetPasswordTokenExpiration

  const newUser = Object.assign(user, obj)

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
  return newUser
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
    emailVerificationTokenExpiration: obj.emailVerificationTokenExpiration,
    id: obj.id
  }

  const newUser = Object.assign(user, cleanedObj)

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
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

  const cleanedObj = {
    password,
    resetPasswordToken,
    resetPasswordTokenExpiration
  }

  const newUser = Object.assign(user, cleanedObj)

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
  return newUser
}

const updateUserResetPasswordToken = async (obj) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const cleanedObj = {
    id: obj.id,
    resetPasswordToken: obj.resetPasswordToken,
    resetPasswordTokenExpiration: obj.resetPasswordTokenExpiration
  }

  const newUser = Object.assign(user, cleanedObj)

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
  return newUser
}

export {
  createUser,
  deleteUser,
  getUser,
  getUserByEmail,
  getUserByResetPasswordToken,
  getUserByVerificationToken,
  getUsers,
  updateUser,
  updateUserEmailVerificationToken,
  updateUserPassword,
  updateUserResetPasswordToken
}
