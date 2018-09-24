import * as passport from 'passport'

export const jwtAuth = passport.authenticate('jwt', { session: false })
