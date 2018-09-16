import { getRepository } from 'typeorm'
import { Category } from 'entities'

const relations = [
  'category', 'categories', 'episodes', 'mediaRefs', 'podcasts'
]

const getCategory = (id) => {
  const repository = getRepository(Category)
  return repository.findOne({ id }, { relations })
}

const getCategories = (query) => {
  const repository = getRepository(Category)

  return repository.find({
    where: {
      ...query
    },
    relations
  })
}

export {
  getCategory,
  getCategories
}
