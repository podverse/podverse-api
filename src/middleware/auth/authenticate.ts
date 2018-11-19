import { generateToken } from 'services/auth/generateToken'
import { Context } from 'koa'

export function authenticate (ctx: Context, next) {
  return generateToken(ctx.state.user)
    .then(token => {
      if (token) {
        ctx.cookies.set('Authentication', `Bearer ${token}`, {
          httpOnly: false,
          overwrite: true
        })
        ctx.status = 200
      } else {
        ctx.status = 500
      }

      next()
    })
}
