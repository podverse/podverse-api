import * as Router from 'koa-router'
import { getMediaRef, getMediaRefs } from 'controllers/mediaRef'
import { validateMediaRefQuery } from './validation/query'

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

export default router
