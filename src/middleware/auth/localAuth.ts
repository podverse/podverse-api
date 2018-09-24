import * as passport from 'passport'

export const localAuth = passport.authenticate('local', { session: false })
