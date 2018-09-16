import { getRepository } from 'typeorm'
import { Author } from 'entities'

const relations = [
  'episodes', 'mediaRefs', 'podcasts'
]

const getAuthor = (id) => {
  const repository = getRepository(Author)
  return repository.findOne({ id }, { relations })
}

const getAuthors = (query) => {
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
