import { Context } from 'koa'

export const logOut = (ctx: Context, next) => {
  ctx.cookies.set('Authentication', undefined)
  ctx.res.statusCode = 200
  next()
}
