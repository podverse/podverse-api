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

const deleteUser = async (id) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const result = await repository.remove(user)
  return result
}

const getUser = async (id) => {
  const repository = getRepository(User)

  const user = await repository.findOne({ id }, { relations })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  return user
}

const getUserByVerificationToken = async (emailVerificationToken) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ emailVerificationToken }, { relations })

  if (!user) {
    throw new createError.NotFound('User not found.')
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

const updateUser = async (obj) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const { password } = obj

  if (password && !validatePassword(password)) {
    throw new createError.BadRequest('Invalid password provided.')
  }

  const newUser = Object.assign(user, obj)

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
  return newUser
}

export {
  createUser,
  deleteUser,
  getUser,
  getUserByVerificationToken,
  getUsers,
  updateUser
}
