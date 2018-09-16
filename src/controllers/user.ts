import { getRepository } from 'typeorm'
import { User } from 'entities'

const relations = ['playlists']

const createUser = async (obj) => {
  const repository = getRepository(User)
  const user = new User()
  const newUser = Object.assign(user, obj)
  await repository.save(newUser)
  return {
    ...newUser
  }
}

const deleteUser = async (id) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id })
  const result = await repository.delete(id)

  return result
}

const getUser = async (id) => {
  const repository = getRepository(User)
  return repository.findOne({ id }, { relations })
}

const getUsers = (query) => {
  const repository = getRepository(User)

  return repository.find({
    where: {
      ...query
    },
    relations
  })
}

const updateUser = async (id, obj) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id })
  const newUser = Object.assign(user, obj)
  await repository.save(newUser)
  return {
    ...newUser
  }
}

export {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser
}
