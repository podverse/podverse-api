import * as bcrypt from 'bcryptjs'
import { getRepository } from 'typeorm'
import { User } from 'entities'
import { validateClassOrThrow } from 'errors'
const createError = require('http-errors')

const relations = ['playlists']

const createUser = async (obj) => {
  const repository = getRepository(User)
  const user = new User()

  const salt = bcrypt.genSaltSync()
  const hash = bcrypt.hashSync(obj.password, salt)

  const newUser = Object.assign(user, obj, { password: hash })

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
  return newUser
}

const deleteUser = async (id) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id })

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  const result = await repository.remove(user)
  return result
}

const getUser = async (id) => {
  const repository = getRepository(User)
  const user = repository.findOne({ id }, { relations })

  if (!user) {
    throw new createError.NotFound('User not found')
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
    throw new createError.NotFound('User not found')
  }

  const salt = bcrypt.genSaltSync()
  const hash = bcrypt.hashSync(obj.password, salt)

  const newUser = Object.assign(user, obj, { password: hash })

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
  return newUser
}

export {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser
}
