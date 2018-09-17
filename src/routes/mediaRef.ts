import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { emitRouterError } from 'errors'
import { deleteMediaRef, getMediaRef, getMediaRefs, updateMediaRef }
  from 'controllers/mediaRef'
import { validateMediaRefQuery } from 'middleware/validation/query'
import { validateMediaRefUpdate } from 'middleware/validation/update'

const router = new Router({ prefix: '/mediaRef' })

router.use(bodyParser())

// Search
router.get('/',
  validateMediaRefQuery,
  async ctx => {
    const mediaRefs = await getMediaRefs(ctx.request.query)
    ctx.body = mediaRefs
  })

// Get
router.get('/:id',
  async ctx => {
    const mediaRef = await getMediaRef(ctx.params.id)
    ctx.body = mediaRef
  })

// Update
router.patch('/',
  validateMediaRefUpdate,
  async ctx => {
    try {
      const body = ctx.request.body
      const mediaRef = await updateMediaRef(body)
      ctx.body = mediaRef
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Delete
router.delete('/:id',
  async ctx => {
    try {
      await deleteMediaRef(ctx.params.id)
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
