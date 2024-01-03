import { authExpires, generateToken } from '~/services/auth'
import { config } from '~/config'

export function authenticate(ctx, next) {
  return generateToken(ctx.state.user).then((bearerToken) => {
    if (bearerToken) {
      const expires = authExpires()

      const { user } = ctx.state

      if (!user.emailVerified) {
        ctx.body = { message: 'Please verify your email address to login.' }
        ctx.status = 460
        return
      }

      ctx.body = {
        addByRSSPodcastFeedUrls: user.addByRSSPodcastFeedUrls,
        email: user.email,
        emailVerified: user.emailVerified,
        freeTrialExpiration: user.freeTrialExpiration,
        id: user.id,
        isPublic: user.isPublic,
        membershipExpiration: user.membershipExpiration,
        name: user.name,
        notifications: user.notifications,
        playlists: user.playlists,
        subscribedPlaylistIds: user.subscribedPlaylistIds,
        subscribedPodcastIds: user.subscribedPodcastIds,
        subscribedUserIds: user.subscribedUserIds
      }

      if (ctx.query.includeBodyToken) {
        ctx.body.token = `Bearer ${bearerToken}`
      } else {
        ctx.cookies.set('Authorization', `Bearer ${bearerToken}`, {
          domain: config.cookieDomain,
          expires,
          httpOnly: true,
          overwrite: true,
          secure: config.cookieIsSecure
        })
      }

      ctx.status = 200
    } else {
      ctx.status = 500
    }

    next()
  })
}
