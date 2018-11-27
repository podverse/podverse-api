import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'lib/errors'
import { delimitQueryValues } from 'lib/utility'
import { addOrRemovePlaylistItem, createPlaylist, deletePlaylist, getPlaylist, getPlaylists,
  updatePlaylist } from 'controllers/playlist'
import { jwtAuth } from 'middleware/auth/jwtAuth'
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
  jwtAuth,
  async ctx => {
    try {
      let body: any = ctx.request.body

      if (ctx.state.user && ctx.state.user.id) {
        body.owner = ctx.state.user.id
      }

      const playlist = await createPlaylist(body)
      ctx.body = playlist
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

// Add or remove mediaRef from playlist
router.patch('/add-or-remove',
  jwtAuth,
  async ctx => {
    try {
      const body: any = ctx.request.body
      const { mediaRefId, playlistId } = body

      const updatedPlaylist = await addOrRemovePlaylistItem(playlistId, mediaRefId, ctx.state.user.id)

      ctx.body = {
        playlistId: updatedPlaylist.id,
        playlistItemCount: updatedPlaylist.itemCount
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export default router
