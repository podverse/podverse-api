import * as Router from 'koa-router'
import { getPlaylist, getPlaylists } from 'controllers/playlist'
import { validatePlaylistQuery } from './validation/query'

const router = new Router({ prefix: '/playlist' })

// Search
router.get('/',
  validatePlaylistQuery,
  async ctx => {
    const playlists = await getPlaylists(ctx.request.query)
    ctx.body = playlists
  }
)

// Get
router.get('/:id', async ctx => {
  const playlist = await getPlaylist(ctx.params.id)
  ctx.body = playlist
})

export default router
