import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
// import { emitRouterError } from '~/lib/errors'
// import { jwtAuth } from '~/middleware/auth'
// import { isPodpingAdmin } from '~/middleware/isPodpingAdmin'
// import { sendPodpingLiveStatusUpdate } from '~/services/podping'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/podping` })
router.use(bodyParser())

// type FeedLiveUpdateBody = {
//   feedUrl: string
//   status: 'live' | 'liveEnd'
// }

// TODO: FIX PODPING ENDPOINTS!

// // Post a liveItem status update notification to PodPing
// router.post('/feed/live-update', jwtAuth, isPodpingAdmin, async (ctx) => {
//   try {
//     const body = ctx.request.body as FeedLiveUpdateBody
//     const { feedUrl, status } = body

//     const validatedUrl = new URL(feedUrl)

//     if (validatedUrl.protocol !== 'http:' && validatedUrl.protocol !== 'https:') {
//       throw new Error('Invalid feed url provided.')
//     }

//     if (status !== 'live' && status !== 'liveEnd') {
//       throw new Error('Invalid status provided. Accepted params "live" or "liveEnd".')
//     }

//     await sendPodpingLiveStatusUpdate(feedUrl, status)

//     ctx.body = {
//       message: 'Podping live update notification sent!'
//     }
//   } catch (error) {
//     emitRouterError(error, ctx)
//   }
// })

export const podpingRouter = router
