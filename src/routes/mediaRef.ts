import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { delimitQueryValues } from 'lib/utility'
import { createMediaRef, deleteMediaRef, getMediaRef, getMediaRefs, updateMediaRef }
  from 'controllers/mediaRef'
import { jwtAuth } from 'middleware/auth/jwtAuth'
import { parseQueryPageOptions } from 'middleware/parseQueryPageOptions'
import { validateMediaRefCreate } from 'middleware/validation/create'
import { validateMediaRefSearch } from 'middleware/validation/search'
import { validateMediaRefUpdate } from 'middleware/validation/update'

const delimitKeys = ['authors', 'categories']

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/mediaRef` })

router.use(bodyParser())

// Search
router.get('/',
  parseQueryPageOptions,
  validateMediaRefSearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const mediaRefs = await getMediaRefs(
        ctx.request.query, 
        ctx.state.queryPageOptions
      )
      ctx.body = mediaRefs
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get
router.get('/:id',
  async ctx => {
    try {
      const mediaRef = await getMediaRef(ctx.params.id)
      ctx.body = mediaRef
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Create
router.post('/',
  validateMediaRefCreate,
  async ctx => {
    try {
      const body = ctx.request.body
      const mediaRef = await createMediaRef(body)
      ctx.body = mediaRef
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update
router.patch('/',
  validateMediaRefUpdate,
  jwtAuth,
  async ctx => {
    try {
      const body = ctx.request.body
      const mediaRef = await updateMediaRef(body, ctx.state.user.id)
      ctx.body = mediaRef
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Delete
router.delete('/:id',
  jwtAuth,
  async ctx => {
    try {
      await deleteMediaRef(ctx.params.id, ctx.state.user.id)
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
