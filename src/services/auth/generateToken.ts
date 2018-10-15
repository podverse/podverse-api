import { sign } from 'jsonwebtoken'
import { config } from 'config'
const { jwtSecret } = config

const genTokenAsync = payload => new Promise((resolve, reject) => {
  return sign(payload, jwtSecret, ((err, encoded) => {
    if (err) return reject(err)
    resolve(encoded)
  }))
})

export const generateToken = async ({ id, roles }) => {
  const exp = Math.floor(Date.now() / 1000) + (60 * 60)

  return genTokenAsync({ id, roles, exp })
    .then(payload => payload)
    .catch(error => { throw error })
}
