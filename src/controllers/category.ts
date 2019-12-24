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

const getCategories = async query => {
  const repository = getRepository(Category)
  const categoryIds = query.id && query.id.split(',') || []
  const { slug, title, topLevelCategories } = query

  const qb = repository
    .createQueryBuilder('category')
    .select('category.id')
    .addSelect('category.slug')
    .addSelect('category.title')
    .leftJoinAndSelect('category.category', 'categoryId')
    .leftJoinAndSelect('category.categories', 'categories')

  if (categoryIds.length > 0) {
    qb.where(
      'category.id IN (:...categoryIds)',
      { categoryIds }
    )
  } else if (slug) {
    const slugLowerCase = `%${slug.toLowerCase().trim()}%`
    qb.where(
      'LOWER(category.slug) LIKE :slug',
      { slug: slugLowerCase }
    )
  } else if (title) {
    const titleLowerCase = `%${title.toLowerCase().trim()}%`
    qb.where(
      'LOWER(category.title) LIKE :title',
      { title: titleLowerCase }
    )
  } else if (topLevelCategories) {
    qb.where(`category.category IS NULL`)
  }

  const categories = await qb
    .orderBy('category.title', 'ASC')
    .getManyAndCount()

  return categories
}

export {
  getCategory,
  getCategories
}
