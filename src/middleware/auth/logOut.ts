import { Context } from 'koa'

export const logOut = (ctx: Context, next) => {
  ctx.cookies.set('Authorization', undefined)
  ctx.res.statusCode = 200
  next()
}
