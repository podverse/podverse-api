import { compare as compareHash } from 'bcryptjs'
import { Strategy as LocalStrategy } from 'passport-local'
import { Repository } from 'typeorm'
import { User } from 'entities'

export const createLocalStrategy = (userRepo: Repository<User>) =>
  new LocalStrategy(
    { session: false, usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await userRepo.findOne({ email })

        const isValid = await compareHash(password, user.password)

        if (isValid) {
          done(null, { ...user, password: undefined })
        } else {
          done(null, false)
        }
      } catch (error) {
        done(error)
      }
    }
  )
