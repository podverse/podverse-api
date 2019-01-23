export const logOut = (ctx, next) => {
  ctx.cookies.set('Authorization', undefined)
  ctx.res.statusCode = 200
  next()
}
