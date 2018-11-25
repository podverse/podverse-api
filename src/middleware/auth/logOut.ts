import { Context } from 'koa'

export const logOut = (ctx: Context, next) => {
  ctx.cookies.set('Authorization', undefined)
  ctx.cookies.set('userId', undefined)
  ctx.res.statusCode = 200
  next()
}
