import { generateToken } from '~/services/auth/generateToken'
import { authExpires } from '~/lib/constants'
import { config } from '~/config'

export function authenticate (ctx, next) {
  return generateToken(ctx.state.user)
    .then(bearerToken => {
      if (bearerToken) {
        const expires = authExpires()
        ctx.cookies.set('Authorization', `Bearer ${bearerToken}`, {
          domain: config.cookieDomain,
          expires,
          httpOnly: true,
          overwrite: true,
          secure: config.cookieIsSecure
        })

        const { user } = ctx.state
        ctx.body = {
          email: user.email,
          freeTrialExpiration: user.freeTrialExpiration,
          historyItems: user.historyItems,
          id: user.id,
          isPublic: user.isPublic,
          membershipExpiration: user.membershipExpiration,
          name: user.name,
          playlists: user.playlists,
          queueItems: user.queueItems,
          subscribedPlaylistIds: user.subscribedPlaylistIds,
          subscribedPodcastIds: user.subscribedPodcastIds,
          subscribedUserIds: user.subscribedUserIds,
          token: `Bearer ${bearerToken}`
        }
        ctx.status = 200
      } else {
        ctx.status = 500
      }

      next()
    })
}
