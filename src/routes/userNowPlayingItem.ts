import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { getEpisode } from '~/controllers/episode'
import { getMediaRef } from '~/controllers/mediaRef'
import { deleteUserNowPlayingItem, getUserNowPlayingItem, updateUserNowPlayingItem } from '~/controllers/userNowPlayingItem'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { validateUserNowPlayingItemUpdate } from '~/middleware/queryValidation/update'
const createError = require('http-errors')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user-now-playing-item` })
router.use(bodyParser())

// Get userNowPlayingItem (as a mediaRef or episode)
router.get('/',
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const userNowPlayingItem = await getUserNowPlayingItem(ctx.state.user.id)

      if (!userNowPlayingItem || (!userNowPlayingItem.episodeId && !userNowPlayingItem.mediaRefId)) {
        throw new createError.NotFound('No now playing item found')
      }

      if (userNowPlayingItem.mediaRefId) {
        const mediaRef = await getMediaRef(userNowPlayingItem.mediaRefId)
        ctx.body = { mediaRef }
      } else {
        const episode = await getEpisode(userNowPlayingItem.episodeId)
        ctx.body = {
          episode,
          userPlaybackPosition: userNowPlayingItem.userPlaybackPosition
        }
      }

      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Delete userNowPlayingItem
router.delete('/',
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      await deleteUserNowPlayingItem(ctx.state.user.id)
      ctx.body = { message: 'UserNowPlayingItem deleted.' }
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update userNowPlayingItem
router.patch('/',
  jwtAuth,
  validateUserNowPlayingItemUpdate,
  hasValidMembership,
  async ctx => {
    try {
      const body = ctx.request.body
      await updateUserNowPlayingItem(body, ctx.state.user.id)
      ctx.body = { message: 'UserNowPlayingItem updated.' }
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const userNowPlayingItemRouter = router
