import { getRepository } from 'typeorm'
import { Category } from 'entities'
const createError = require('http-errors')

const relations = [
  'category', 'categories'
]

const getCategory = (id) => {
  const repository = getRepository(Category)
  const category = repository.findOne({ id }, { relations })

  if (!category) {
    throw new createError.NotFound('Category not found')
  }

  return category
}

const getCategories = (query) => {
  const repository = getRepository(Category)
  const findObj = {
    where: {
      ...query
    },
    relations
  }

  return repository.find(findObj)
}

export {
  getCategory,
  getCategories
}
