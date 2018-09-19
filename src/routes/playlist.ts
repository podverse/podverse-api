import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { delimitQueryValues } from 'utility'
import { createPlaylist, deletePlaylist, getPlaylist, getPlaylists, updatePlaylist }
  from 'controllers/playlist'
import { validatePlaylistCreate } from 'middleware/validation/create'
import { validatePlaylistSearch } from 'middleware/validation/search'
import { validatePlaylistUpdate } from 'middleware/validation/update'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/playlist` })

const delimitKeys = ['mediaRefs']

router.use(bodyParser())

// Search
router.get('/',
validatePlaylistSearch,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const playlists = await getPlaylists(ctx.request.query)
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
  async ctx => {
    try {
      const body = ctx.request.body
      const playlist = await updatePlaylist(body)
      ctx.body = playlist
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Delete
router.delete('/:id',
  async ctx => {
    try {
      await deletePlaylist(ctx.params.id)
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
