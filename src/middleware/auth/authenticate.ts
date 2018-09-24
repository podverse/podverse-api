import { sign } from 'jsonwebtoken'
import { Context } from 'koa'

const genTokenAsync = payload => new Promise((resolve, reject) => {
  return sign(payload, process.env.JWT_SECRET, ((err, encoded) => {
    if (err) return reject(err)
    resolve(encoded)
  }))
})

const generateToken = async ({ id, roles }) => {
  const exp = Math.floor(Date.now() / 1000) + (60 * 60)

  return genTokenAsync({ id, roles, exp })
    .then(payload => payload)
    .catch(error => { throw error })
}

export function authenticate (ctx: Context, next) {
  return generateToken(ctx.state.user)
    .then(token => {
      if (token) {
        ctx.set('Authentication', `Bearer ${token}`)
        ctx.status = 200
      } else {
        ctx.status = 500
      }

      next()
    })
}
