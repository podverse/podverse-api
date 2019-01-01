import { sign } from 'jsonwebtoken'
import { config } from 'config'
import { authExpires } from 'lib/constants'
const { jwtSecret } = config

const genTokenAsync = payload => new Promise((resolve, reject) => {
  return sign(payload, jwtSecret, ((err, encoded) => {
    if (err) return reject(err)
    resolve(encoded)
  }))
})

export const generateToken = async ({ id }) => {
  const exp = authExpires().getTime() / 1000

  return genTokenAsync({ id, exp })
    .then(payload => payload)
    .catch(error => { throw error })
}
