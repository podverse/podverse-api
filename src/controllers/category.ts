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

const getCategories = (query, options) => {
  const repository = getRepository(Category)
  
  return repository.find({
    where: {
      ...query
    },
    relations,
    ...options
  })
}

export {
  getCategory,
  getCategories
}
