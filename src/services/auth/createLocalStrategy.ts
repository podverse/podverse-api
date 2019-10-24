import { compare as compareHash } from 'bcryptjs'
import { Strategy as LocalStrategy } from 'passport-local'
import { Repository } from 'typeorm'
import { User } from '~/entities'
const createError = require('http-errors')

const relations = ['playlists']

export const createLocalStrategy = (userRepo: Repository<User>) =>
  new LocalStrategy(
    { session: false, usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await userRepo.findOne(
          {
            email
          },
          {
            select: [
              'email',
              'emailVerified',
              'freeTrialExpiration',
              'historyItems',
              'id',
              'membershipExpiration',
              'name',
              'password',
              'queueItems',
              'subscribedPlaylistIds',
              'subscribedPodcastIds',
              'subscribedUserIds'
            ],
            relations
          }
        )

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
        done(new createError.Unauthorized('Invalid email or password'))
      }
    }
  )
