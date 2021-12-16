import * as Router from 'koa-router'
import type { ActivityPubNote, SocialInteraction } from 'podverse-shared'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { delimitQueryValues } from '~/lib/utility'
import { getEpisode, getEpisodes, getEpisodesByCategoryIds, getEpisodesByPodcastIds,
  retrieveLatestChapters } from '~/controllers/episode'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validateEpisodeSearch } from '~/middleware/queryValidation/search'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { request } from '~/lib/request'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/episode` })

const delimitKeys = ['authors', 'mediaRefs']

// Search
router.get('/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'episodes'),
  validateEpisodeSearch,
  parseNSFWHeader,
  async ctx => {
    try {
      ctx = delimitQueryValues(ctx, delimitKeys)

      let episodes
      if (ctx.state.query.categories) {
        episodes = await getEpisodesByCategoryIds(ctx.state.query)
      } else if (ctx.state.query.podcastId) {
        episodes = await getEpisodesByPodcastIds(ctx.state.query)
      } else {
        episodes = await getEpisodes(ctx.state.query)
      }


      ctx.body = episodes
    } catch (error) {
      emitRouterError(error, ctx)
    }
  }
)

// Get
router.get('/:id',
  parseNSFWHeader,
  async ctx => {
    try {
      const episode = await getEpisode(ctx.params.id)

      ctx.body = episode
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

router.get('/:id/retrieve-latest-chapters',
  async ctx => {
    try {
      if (!ctx.params.id) throw new Error('An episodeId is required.')
      const latestChapters = await retrieveLatestChapters(ctx.params.id)
      ctx.body = latestChapters
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

router.get('/:id/proxy/activity-pub',
  async ctx => {
    try {
      if (!ctx.params.id) throw new Error('An episodeId is required.')
      const episode = await getEpisode(ctx.params.id)
      if (!episode) {
        throw new Error('No episode found with that id.')
      }
      if (!episode.socialInteraction || episode.socialInteraction.length === 0) {
        throw new Error('No socialInteraction value found for episode.')
      }
      const activityPub = episode.socialInteraction.find(
        (item: SocialInteraction) => item.platform === 'activitypub'
      )
      if (!activityPub || !activityPub.url) {
        throw new Error('No activityPub url found for episode.')
      }
      const rootCommentText = await request(activityPub.url, {
        headers: {
          Accept: 'application/activity+json'
        }
      })

      const rootComment = JSON.parse(rootCommentText)
      if (!rootComment?.replies?.first?.next) {
        throw new Error('Next URL missing from the activityPub note')
      }
      const nextUrl = rootComment.replies.first.next
      const repliesText = await request(nextUrl, {
        headers: {
          Accept: 'application/activity+json'
        }
      })

      const replies = JSON.parse(repliesText)

      /*
        If the replies.items array returns strings (URLs that point to ActivityPub Notes),
        then make a request for each URL in the array to retrieve the Note,
        then insert it into the replies.items array.
      */
      const hasOnlyStringUrlItems = replies?.items.every((item) => typeof item === 'string')

      if (hasOnlyStringUrlItems) {
        const repliesItemsNotes: ActivityPubNote[] = []
        let limitRequests = 0
        for (const url of replies.items) {
          limitRequests++
          if (limitRequests >= 50) break
          const itemNoteText = await request(url, {
            headers: {
              Accept: 'application/activity+json'
            }
          })
          const itemNote = JSON.parse(itemNoteText)
          repliesItemsNotes.push(itemNote)
        }
        replies.items = repliesItemsNotes
      } else if (replies) {
        /* Else filter out the strings from the replies.items array */
        replies.items = replies.items.filter((item) => typeof item === 'object')
      }

      ctx.body = {
        rootComment,
        replies
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

export const episodeRouter = router
