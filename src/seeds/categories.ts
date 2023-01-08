import { Connection } from 'typeorm'
import { deleteCategoryByTitle, getCategories } from '~/controllers/category'
import { Category } from '~/entities'
import { logPerformance, _logEnd, _logStart } from '~/lib/utility'

export const generateCategories = async (connection: Connection, data: any): Promise<any> => {
  logPerformance('generateCategories', _logStart)
  const existingCategoriesAndCount = await getCategories({})
  let existingCategories = existingCategoriesAndCount[0]

  for (const category of data) {
    let title
    let parentId

    if (category.indexOf('>') > 0) {
      title = category.split('>')[1]
      const parentTitle = category.split('>')[0]
      const categoriesAndCount = await getCategories({ title: parentTitle })
      const categories = categoriesAndCount[0]

      if (categories.length > 0) {
        parentId = categories[0].id
      }
    } else {
      title = category
    }

    existingCategories = existingCategories.filter((x) => x.title !== title)
    const newCategory = generateCategory(category, title, parentId)
    const existingCategoryAndCount = await getCategories({ title })
    const existingCategory = existingCategoryAndCount[0]

    if (existingCategory[0]) {
      newCategory.id = existingCategory[0].id
    }

    await connection.manager.save(newCategory)
  }

  const existingSubCategories = existingCategories.filter((x) => x.category)
  const existingParentCategories = existingCategories.filter((x) => !x.category)
  for (const category of existingSubCategories) {
    await deleteCategoryByTitle(category.title)
  }
  for (const category of existingParentCategories) {
    await deleteCategoryByTitle(category.title)
  }
  logPerformance('generateCategories', _logEnd)
}

const generateCategory = (fullPath, title, parentId) => {
  const category = new Category()
  category.fullPath = fullPath
  category.title = title
  category.category = parentId
  return category
}

// connectToDb().then(async (connection) => {
//   if (connection) {
//     await generateCategories(connection, validCategories)
//   }
// })
