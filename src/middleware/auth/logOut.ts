import { config } from '~/config'

export const logOut = (ctx, next) => {
  ctx.cookies.set('Authorization', '', {
    domain: config.cookieDomain,
    httpOnly: true,
    overwrite: true,
    secure: config.cookieIsSecure
  })
  ctx.res.statusCode = 200
  next()
}
