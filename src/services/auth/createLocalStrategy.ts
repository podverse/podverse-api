import { compare as compareHash } from 'bcryptjs'
import createError from 'http-errors'
import { Strategy as LocalStrategy } from 'passport-local'
import { getRepository, User } from 'podverse-orm'

export const createLocalStrategy = () =>
  new LocalStrategy({ session: false, usernameField: 'email' }, async (email, password, done) => {
    try {
      const repository = getRepository(User)

      const qb = repository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.addByRSSPodcastFeedUrls',
          'user.email',
          'user.emailVerified',
          'user.freeTrialExpiration',
          'user.membershipExpiration',
          'user.name',
          'user.password',
          'user.subscribedPlaylistIds',
          'user.subscribedPodcastIds',
          'user.subscribedUserIds',
          'notifications.createdAt',
          'notifications.updatedAt',
          'podcast.id'
        ])
        .leftJoin('user.notifications', 'notifications')
        .leftJoin('notifications.podcast', 'podcast')
        .leftJoinAndSelect('user.playlists', 'playlists')
        .where('user.email ILIKE :email', { email })

      const user = (await qb.getOne()) as User

      if (user) {
        const isValid = await compareHash(password, user.password)
        if (!email || !password || !user || !isValid) {
          throw new createError.Unauthorized('Invalid email or password')
        } else {
          done(null, { ...user, password: undefined })
        }
      } else {
        throw new createError.Unauthorized('Invalid email or password')
      }
    } catch (error) {
      console.log('error', error)
      done(new createError.Unauthorized('Invalid email or password'))
    }
  })
