import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { delimitQueryValues } from 'lib/utility'
import { createPlaylist, deletePlaylist, getPlaylist, getPlaylists, updatePlaylist }
  from 'controllers/playlist'
import { jwtAuth } from 'middleware/auth/jwtAuth';
import { parseQueryPageOptions } from 'middleware/parseQueryPageOptions'
import { validatePlaylistCreate } from 'middleware/validation/create'
import { validatePlaylistSearch } from 'middleware/validation/search'
import { validatePlaylistUpdate } from 'middleware/validation/update'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/playlist` })

const delimitKeys = ['mediaRefs']

router.use(bodyParser())

// Search
router.get('/',
  parseQueryPageOptions,
  validatePlaylistSearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const playlists = await getPlaylists(ctx.request.query, ctx.state.queryPageOptions)
      ctx.body = playlists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get
router.get('/:id',
  async ctx => {
    try {
      const playlist = await getPlaylist(ctx.params.id)
      ctx.body = playlist
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Create
router.post('/',
  validatePlaylistCreate,
  async ctx => {
    try {
      const body = ctx.request.body
      const mediaRef = await createPlaylist(body)
      ctx.body = mediaRef
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update
router.patch('/',
  validatePlaylistUpdate,
  jwtAuth,
  async ctx => {
    try {
      const body = ctx.request.body
      const playlist = await updatePlaylist(body, ctx.state.user.id)
      ctx.body = playlist
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Delete
router.delete('/:id',
  jwtAuth,
  async ctx => {
    try {
      await deletePlaylist(ctx.params.id, ctx.state.user.id)
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
