import { generateToken } from 'services/auth/generateToken'
import { Context } from 'koa'

export function authenticate (ctx: Context, next) {
  return generateToken(ctx.state.user)
    .then(token => {
      if (token) {
        let expires = new Date()
        expires.setDate(expires.getDate() + 365)
        ctx.cookies.set('Authorization', `Bearer ${token}`, {
          expires,
          httpOnly: true,
          overwrite: true
        })

        const { user } = ctx.state
        ctx.body = {
          historyItems: user.historyItems,
          id: user.id,
          playlists: user.playlists,
          queueItems: user.queueItems,
          subscribedPlaylistIds: user.subscribedPlaylistIds,
          subscribedPodcastIds: user.subscribedPodcastIds
        }
        ctx.status = 200
      } else {
        ctx.status = 500
      }

      next()
    })
}
