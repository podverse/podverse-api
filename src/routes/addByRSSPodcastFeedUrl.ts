import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { addByRSSPodcastFeedUrlAdd, addByRSSPodcastFeedUrlRemove } from '~/controllers/user'
import { emitRouterError } from '~/lib/errors'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { hasValidMembership } from '~/middleware/hasValidMembership'
const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config
const validUrl = require('valid-url')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/add-by-rss-podcast-feed-url` })

router.use(bodyParser())

const addLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 15,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/add-by-rss-podcast-feed-url/add'
})

router.post('/add',
  addLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const { addByRSSPodcastFeedUrl } = ctx.request.body as any

      if (!addByRSSPodcastFeedUrl) {
        ctx.body = { message: 'An addByRSSPodcastFeedUrl field is required in the request body.' }
        ctx.status = 400
      } else if (!validUrl.isUri(addByRSSPodcastFeedUrl)) {
        ctx.body = { message: 'Invalid addByRSSPodcastFeedUrl. Please check your URL.' }
        ctx.status = 400
      } else {
        const addByRSSPodcastFeedUrls = await addByRSSPodcastFeedUrlAdd(addByRSSPodcastFeedUrl, ctx.state.user.id)
        ctx.body = addByRSSPodcastFeedUrls
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

const removeLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max: rateLimiterMaxOverride || 15,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/add-by-rss-podcast-feed-url/remove'
})

router.post('/remove',
  removeLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const { addByRSSPodcastFeedUrl } = ctx.request.body as any

      if (!addByRSSPodcastFeedUrl) {
        ctx.body = { message: 'An addByRSSPodcastFeedUrl field is required in the request body.' }
        ctx.status = 400
      } else if (!validUrl.isUri(addByRSSPodcastFeedUrl)) {
        ctx.body = { message: 'Invalid addByRSSPodcastFeedUrl. Please check your URL.' }
        ctx.status = 400
      } else {
        const addByRSSPodcastFeedUrls = await addByRSSPodcastFeedUrlRemove(addByRSSPodcastFeedUrl, ctx.state.user.id)
        ctx.body = addByRSSPodcastFeedUrls
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })  

export const addByRSSPodcastFeedUrlRouter = router
