import * as passport from 'passport'

export const jwtAuth = passport.authenticate('jwt', { session: false })

export const optionalJwtAuth = async (ctx, next) => {
  passport.authenticate('jwt', { session: false })
  await next()
}
