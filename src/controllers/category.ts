import { getRepository } from 'typeorm'
import { Category } from '~/entities'
const createError = require('http-errors')

const getCategory = id => {
  const repository = getRepository(Category)
  const category = repository.findOne({ id }, {
    relations: ['category', 'category.category', 'categories']
  })

  if (!category) {
    throw new createError.NotFound('Category not found')
  }

  return category
}

const getCategories = (query, options = {}) => {
  const repository = getRepository(Category)

  return repository.find({
    where: {
      ...query
    },
    relations: ['category', 'categories'],
    ...options
  })
}

export {
  getCategory,
  getCategories
}
