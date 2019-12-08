import { Connection } from 'typeorm'
import { validCategories } from '~/config/categories'
import { getCategories } from '~/controllers/category'
import { Category } from '~/entities'
import { connectToDb } from '~/lib/db'

const generateCategories = async (
  connection: Connection,
  data: any
): Promise<any> => {
  for (const category of data) {
    let title
    let parentId

    if (category.indexOf('>') > 0) {
      title = category.split('>')[1]
      const parentTitle = category.split('>')[0]
      const categoriesAndCount = await getCategories({
        title: parentTitle
      })
      const categories = categoriesAndCount[0]

      if (categories.length > 0) {
        parentId = categories[0].id
      }
    } else {
      title = category
    }

    const newCategory = generateCategory(category, title, parentId)

    await connection.manager.save(newCategory)
  }
}

const generateCategory = (fullPath, title, parentId) => {
  const category = new Category()
  category.fullPath = fullPath
  category.title = title
  category.category = parentId
  return category
}

connectToDb()
  .then(async connection => {
    if (connection) {
      await generateCategories(connection, validCategories)
    }
  })
