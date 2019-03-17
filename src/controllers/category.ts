import { getRepository } from 'typeorm'
import { Category } from '~/entities'
const createError = require('http-errors')

const getCategory = async id => {
  const repository = getRepository(Category)
  const category = await repository.findOne({ id }, {
    relations: ['category', 'category.category', 'categories']
  })

  if (!category) {
    throw new createError.NotFound('Category not found')
  }

  return category
}

const getCategories = async (query, options = {}) => {
  const repository = getRepository(Category)
  let categoryIds = query.id && query.id.split(',') || []
  const { skip, slug, take, title } = query

  let qb = repository
    .createQueryBuilder('category')
    .select('category.id')
    .addSelect('category.slug')
    .addSelect('category.title')

  if (categoryIds.length > 0) {
    qb.where(
      'category.id IN (:...categoryIds)',
      { categoryIds }
    )
  } else if (slug) {
    const slugLowerCase = `%${slug.toLowerCase()}%`
    qb.where(
      'LOWER(category.slug) LIKE :slug',
      { slug: slugLowerCase }
    )
  } else if (title) {
    const titleLowerCase = `%${title.toLowerCase()}%`
    qb.where(
      'LOWER(category.title) LIKE :title',
      { title: titleLowerCase }
    )
  }

  const categories = await qb
    .skip(skip)
    .take(take)
    .getManyAndCount()

  return categories
}

export {
  getCategory,
  getCategories
}
