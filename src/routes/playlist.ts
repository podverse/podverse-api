import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { deletePlaylist, getPlaylist, getPlaylists, updatePlaylist }
  from 'controllers/playlist'
import { validatePlaylistSearch } from 'middleware/validation/search'
import { validatePlaylistUpdate } from 'middleware/validation/update'
const createError = require('http-errors')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/playlist` })

router.use(bodyParser())

// Search
router.get('/',
  validatePlaylistSearch,
  async ctx => {
    try {
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
      if (!playlist) {
        throw new createError.NotFound()
      }
      ctx.body = playlist
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
