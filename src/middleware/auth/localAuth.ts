import * as passport from 'passport'
import { authenticate } from './authenticate'

export const localAuth = async (ctx, next) => {
  await passport.authenticate('local', async (err, user) => {
    if (err) {
      ctx.status = err.status
      ctx.body = {
        message: 'Invalid username or password'
      }
      ctx.type = 'json'
      next()
    } else {
      ctx.state.user = user
      await authenticate(ctx, next)
    }
  })(ctx)
}
