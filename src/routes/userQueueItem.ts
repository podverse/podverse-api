import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import {
  addOrUpdateQueueItem,
  getCleanedUserQueueItems,
  popNextFromQueue,
  removeAllUserQueueItems,
  removeUserQueueItemByEpisodeId,
  removeUserQueueItemByMediaRefId
} from '~/controllers/userQueueItem'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { requireAndParseMediumQueryParam } from '~/middleware/hasMediumQueryParam'
import { hasValidMembership } from '~/middleware/hasValidMembership'
import { validateAddOrUpdateUserQueueItem } from '~/middleware/queryValidation/update'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/user-queue-item` })
router.use(bodyParser())

/* /user-queue-item/medium is used as of Podverse mobile v4.14.0 */

const mediumPath = '/medium'

// TODO: VALIDATE THAT medium QUERY PARAM IS ALWAYS PASSED

// Get userQueueItems
router.get(`${mediumPath}/`, jwtAuth, hasValidMembership, requireAndParseMediumQueryParam, async (ctx) => {
  try {
    const results = await getCleanedUserQueueItems(ctx.state.user.id, ctx.state.query.medium)
    ctx.body = results
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Add or update userQueueItem
router.patch(
  `${mediumPath}/`,
  jwtAuth,
  validateAddOrUpdateUserQueueItem,
  hasValidMembership,
  requireAndParseMediumQueryParam,
  async (ctx) => {
    try {
      const results = await addOrUpdateQueueItem(ctx.state.user.id, ctx.request.body, ctx.state.query.medium)
      ctx.status = 200
      ctx.body = results
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Pop next user queue item
router.get(`${mediumPath}/pop-next`, jwtAuth, hasValidMembership, requireAndParseMediumQueryParam, async (ctx) => {
  try {
    const results = await popNextFromQueue(ctx.state.user.id, ctx.state.query.medium)
    ctx.body = results
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Remove UserQueueItem by episodeId
router.delete(
  `${mediumPath}/episode/:episodeId`,
  jwtAuth,
  hasValidMembership,
  requireAndParseMediumQueryParam,
  async (ctx) => {
    try {
      const userQueueItems = await removeUserQueueItemByEpisodeId(
        ctx.state.user.id,
        ctx.params.episodeId,
        ctx.state.query.medium
      )
      ctx.body = userQueueItems
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Remove UserQueueItem by mediaRefId
router.delete(
  `${mediumPath}/mediaRef/:mediaRefId`,
  jwtAuth,
  hasValidMembership,
  requireAndParseMediumQueryParam,
  async (ctx) => {
    try {
      const userQueueItems = await removeUserQueueItemByMediaRefId(
        ctx.state.user.id,
        ctx.params.mediaRefId,
        ctx.state.query.medium
      )
      ctx.body = userQueueItems
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Remove all UserQueueItem for logged-in user
router.delete(`${mediumPath}/remove-all`, jwtAuth, hasValidMembership, requireAndParseMediumQueryParam, async (ctx) => {
  try {
    await removeAllUserQueueItems(ctx.state.user.id, ctx.state.query.medium)
    ctx.body = { message: 'All UserQueueItems removed.' }
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

/* **************** */

/* /user-queue-item has been replaced with /user-queue-item/medium as of Podverse mobile v4.14.0 */

const mediumQueueDefault = 'mixed'

// Get userQueueItems
router.get('/', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    const results = await getCleanedUserQueueItems(ctx.state.user.id, mediumQueueDefault)
    ctx.body = results
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Add or update userQueueItem
router.patch('/', jwtAuth, validateAddOrUpdateUserQueueItem, hasValidMembership, async (ctx) => {
  try {
    const results = await addOrUpdateQueueItem(ctx.state.user.id, ctx.request.body, mediumQueueDefault)
    ctx.status = 200
    ctx.body = results
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Pop next user queue item
router.get('/pop-next', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    const results = await popNextFromQueue(ctx.state.user.id, mediumQueueDefault)
    ctx.body = results
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Remove UserQueueItem by episodeId
router.delete('/episode/:episodeId', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    const userQueueItems = await removeUserQueueItemByEpisodeId(
      ctx.state.user.id,
      ctx.params.episodeId,
      mediumQueueDefault
    )
    ctx.body = userQueueItems
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Remove UserQueueItem by mediaRefId
router.delete('/mediaRef/:mediaRefId', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    const userQueueItems = await removeUserQueueItemByMediaRefId(
      ctx.state.user.id,
      ctx.params.mediaRefId,
      mediumQueueDefault
    )
    ctx.body = userQueueItems
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

// Remove all UserQueueItem for logged-in user
router.delete('/remove-all', jwtAuth, hasValidMembership, async (ctx) => {
  try {
    await removeAllUserQueueItems(ctx.state.user.id, mediumQueueDefault)
    ctx.body = { message: 'All UserQueueItems removed.' }
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

export const userQueueItemRouter = router
