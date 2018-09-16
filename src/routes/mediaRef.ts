import * as Router from 'koa-router'
import { deleteMediaRef, getMediaRef, getMediaRefs } 
  from 'controllers/mediaRef'
import { validateMediaRefQuery } from './validation/query'
import { emitError } from 'routes/error'

const router = new Router({ prefix: '/mediaRef' })

// Search
router.get('/',
  validateMediaRefQuery,
  async ctx => {
    const mediaRefs = await getMediaRefs(ctx.request.query)
    ctx.body = mediaRefs
  }
)

// Get
router.get('/:id', async ctx => {
  const mediaRef = await getMediaRef(ctx.params.id)
  ctx.body = mediaRef
})

// Delete
router.delete('/:id', async ctx => {
  try {
    const result = await deleteMediaRef(ctx.params.id)
    ctx.status = 200
  } catch (error) {
    emitError(ctx.status, error.message, error, ctx)
  }
})

export default router
