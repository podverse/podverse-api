import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import { addOrRemovePlaylistItem, createPlaylist, deletePlaylist, getPlaylist, getPlaylists,
  getSubscribedPlaylists, toggleSubscribeToPlaylist, updatePlaylist } from '~/controllers/playlist'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validatePlaylistCreate } from '~/middleware/queryValidation/create'
import { validatePlaylistSearch } from '~/middleware/queryValidation/search'
import { validatePlaylistUpdate } from '~/middleware/queryValidation/update'
import { hasValidMembership } from '~/middleware/hasValidMembership'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/playlist` })

const delimitKeys = ['mediaRefs']

router.use(bodyParser())

// Search
router.get('/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
  validatePlaylistSearch,
  parseNSFWHeader,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)
      const playlists = await getPlaylists(ctx.state.query)

      ctx.body = playlists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Search Subscribed Playlists
router.get('/subscribed',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
  validatePlaylistSearch,
  jwtAuth,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)

      if (ctx.state.user && ctx.state.user.id) {
        const playlists = await getSubscribedPlaylists(ctx.state.query, ctx.state.user.id)
        ctx.body = playlists
      } else {
        throw new Error('You must be logged in to get your subscribed playlists.')
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get
router.get('/:id',
  parseNSFWHeader,
  async ctx => {
    try {
      const playlist = await getPlaylist(ctx.params.id)

      ctx.body = playlist
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Create
const createPlaylistLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/playlist'
})

router.post('/',
  validatePlaylistCreate,
  createPlaylistLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      body.owner = ctx.state.user.id

      const playlist = await createPlaylist(body)
      ctx.body = playlist
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update
const updatePlaylistLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 20,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/playlist'
})

router.patch('/',
  validatePlaylistUpdate,
  updatePlaylistLimiter,
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

// Add/remove mediaRef/episode to/from playlist
const addOrRemovePlaylistLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 30,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/add-or-remove'
})

router.patch('/add-or-remove',
  addOrRemovePlaylistLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      const { episodeId, mediaRefId, playlistId } = body

      const results = await addOrRemovePlaylistItem(playlistId, mediaRefId, episodeId, ctx.state.user.id)
      const updatedPlaylist = results[0] as any
      const actionTaken = results[1]
      ctx.body = {
        playlistId: updatedPlaylist.id,
        playlistItemCount: updatedPlaylist.itemCount,
        actionTaken
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Toggle subscribe to playlist
const toggleSubscribeLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 15,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'get/playlist/toggle-subscribe'
})

router.get('/toggle-subscribe/:id',
  toggleSubscribeLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const subscribedPlaylistIds = await toggleSubscribeToPlaylist(ctx.params.id, ctx.state.user.id)
      ctx.body = subscribedPlaylistIds
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const playlistRouter = router
