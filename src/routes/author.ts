import * as Router from 'koa-router'
import { getAuthor, getAuthors } from 'controllers/author'
import { validateAuthorSearch } from 'middleware/validation/search'

const router = new Router({ prefix: '/author' })

// Search
router.get('/',
  validateAuthorSearch,
  async ctx => {
    const authors = await getAuthors(ctx.request.query)    
    ctx.body = authors
  }
)

// Get
router.get('/:id',
  async ctx => {
    const author = await getAuthor(ctx.params.id)
    ctx.body = author
  })

export default router
