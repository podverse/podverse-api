import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import {
  addOrUpdateQueueItem,
  getCleanedUserQueueItems,
  popNextFromQueue,
  removeAllUserQueueItems,
  removeUserQueueItemByEpisodeId,
  removeUserQueueItemByMediaRefId
} from 'podverse-orm'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { validateAddOrUpdateUserQueueItem } from '~/middleware/queryValidation/update'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user-queue-item` })
router.use(bodyParser())

// Get userQueueItems
router.get('/', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    const { useGetMany } = ctx.query
    const results = await getCleanedUserQueueItems(ctx.state.user.id, !!useGetMany)
    ctx.body = results
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Add or update userQueueItem
router.patch('/', jwtAuth, validateAddOrUpdateUserQueueItem, hasValidMembership, async (ctx) => {
  try {
    const results = await addOrUpdateQueueItem(ctx.state.user.id, ctx.request.body)
    ctx.status = 200
    ctx.body = results
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Pop next user queue item
router.get('/pop-next', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    const results = await popNextFromQueue(ctx.state.user.id)
    ctx.body = results
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Remove UserQueueItem by episodeId
router.delete('/episode/:episodeId', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    const userQueueItems = await removeUserQueueItemByEpisodeId(ctx.state.user.id, ctx.params.episodeId)
    ctx.body = userQueueItems
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Remove UserQueueItem by mediaRefId
router.delete('/mediaRef/:mediaRefId', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    const userQueueItems = await removeUserQueueItemByMediaRefId(ctx.state.user.id, ctx.params.mediaRefId)
    ctx.body = userQueueItems
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Remove all UserQueueItem for logged-in user
router.delete('/remove-all', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    await removeAllUserQueueItems(ctx.state.user.id)
    ctx.body = { message: 'All UserQueueItems removed.' }
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const userQueueItemRouter = router
