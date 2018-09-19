import { getRepository } from 'typeorm'
import { Author } from 'entities'
const createError = require('http-errors')

const relations = []

const getAuthor = id => {
  const repository = getRepository(Author)
  const author = repository.findOne({ id }, { relations })

  if (!author) {
    throw new createError.NotFound('MediaRef not found')
  }
  
  return author
}

const getAuthors = query => {
  const repository = getRepository(Author)

  return repository.find({
    where: {
      ...query
    },
    relations
  })
}

export {
  getAuthor,
  getAuthors
}
