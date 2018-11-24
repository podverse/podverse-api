import { generateToken } from 'services/auth/generateToken'
import { Context } from 'koa'

export function authenticate (ctx: Context, next) {
  return generateToken(ctx.state.user)
    .then(token => {
      if (token) {
        ctx.cookies.set('Authorization', `Bearer ${token}`, {
          httpOnly: true,
          overwrite: true
        })
        ctx.cookies.set('userId', `${ctx.state.user.id}`, {
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
