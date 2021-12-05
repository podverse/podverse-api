import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { addOrUpdateHistoryItem, getUserHistoryItems, getUserHistoryItemsMetadata,
  getUserHistoryItemsMetadataMini,
  removeAllUserHistoryItems, removeUserHistoryItemByEpisodeId, removeUserHistoryItemByMediaRefId
  } from '~/controllers/userHistoryItem'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateAddOrUpdateUserHistoryItem } from '~/middleware/queryValidation/update'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user-history-item` })
router.use(bodyParser())

// Get userHistoryItems
router.get('/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'userHistoryItems'),
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const results = await getUserHistoryItems(ctx.state.user.id, ctx.state.query)      
      ctx.body = {
        userHistoryItems: results.userHistoryItems,
        userHistoryItemsCount: results.userHistoryItemsCount
      }
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get userHistoryItems metadata only
router.get('/metadata',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'userHistoryItems'),
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const userHistoryItems = await getUserHistoryItemsMetadata(ctx.state.user.id)
      ctx.body = { userHistoryItems }
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Get minified userHistoryItems metadata only
router.get('/metadata-mini',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'userHistoryItems'),
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const userHistoryItems = await getUserHistoryItemsMetadataMini(ctx.state.user.id)
      ctx.body = { userHistoryItems }
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Add or update userHistoryItem
router.patch('/',
  jwtAuth,
  validateAddOrUpdateUserHistoryItem,
  hasValidMembership,
  async ctx => {
    try {
      await addOrUpdateHistoryItem(ctx.state.user.id, ctx.request.body)
      ctx.status = 200
      ctx.body = { message: 'Updated user history item.' }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Remove UserHistoryItem by episodeId
router.delete('/episode/:episodeId',
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      await removeUserHistoryItemByEpisodeId(ctx.state.user.id, ctx.params.episodeId)
      ctx.body = { message: 'UserHistoryItem deleted.' }
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Remove UserHistoryItem by mediaRefId
router.delete('/mediaRef/:mediaRefId',
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      await removeUserHistoryItemByMediaRefId(ctx.state.user.id, ctx.params.mediaRefId)
      ctx.body = { message: 'UserHistoryItem deleted.' }
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Remove all UserHistoryItems for logged-in user
router.delete('/remove-all',
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      await removeAllUserHistoryItems(ctx.state.user.id)
      ctx.body = { message: 'All UserHistoryItems deleted.' }
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const userHistoryItemRouter = router
