import { Connection } from 'typeorm'
import { validCategories } from '~/config/categories'
import { Category } from '~/entities'
import { connectToDb } from '~/lib/db'

const generateCategories = async (
  connection: Connection,
  data: any,
  parent: any,
  shouldSave: boolean
): Promise<any> => {
  let newCategories: any[] = []
  for (let category of data) {
    category.parent = parent
    let c = generateCategory(category)
    newCategories.push(c)

    if (category.categories && category.categories.length > 0) {
      const subCategories = await generateCategories(
        connection, category.categories, c, false
      )
      newCategories = newCategories.concat(subCategories)
    }
  }

  if (shouldSave) {
    await connection.manager.save(newCategories)
  }

  return newCategories
}

const generateCategory = (data: any) => {
  let category = new Category()
  category.title = data.title
  category.category = data.parent
  return category
}

connectToDb()
  .then(async connection => {
    if (connection) {
      await generateCategories(connection, validCategories, null, true)
    }
  })

