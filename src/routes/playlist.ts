import * as Router from 'koa-router'
import { deletePlaylist, getPlaylist, getPlaylists }
  from 'controllers/playlist'
import { validatePlaylistQuery } from './validation/query'
import { emitError } from 'routes/error'

const router = new Router({ prefix: '/playlist' })

// Search
router.get('/',
  validatePlaylistQuery,
  async ctx => {
    try {
      const playlists = await getPlaylists(ctx.request.query)
      ctx.body = playlists
    } catch (error) {
      emitError(500, null, error, ctx)
    }
  }
)

// Get
router.get('/:id', async ctx => {
  try {
    const playlist = await getPlaylist(ctx.params.id)
    ctx.body = playlist
  } catch (error) {
    emitError(ctx.status, error.message, error, ctx)
  }
})

// Delete
router.delete('/:id', async ctx => {
  try {
    await deletePlaylist(ctx.params.id)
    ctx.status = 200
  } catch (error) {
    console.log(error);
     
    emitError(ctx.status, error.message, error, ctx)
  }
})

export default router
