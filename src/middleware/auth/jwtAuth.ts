import * as passport from 'passport'

export const jwtAuth = passport.authenticate('jwt', { session: false })

export const optionalJwtAuth = async (ctx, next) => {
  await passport.authenticate('jwt', { session: false }, async (_, user) => {
    ctx.state.user = user
    await next(ctx)
  })(ctx, next)
}
