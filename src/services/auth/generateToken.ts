import { sign } from 'jsonwebtoken'

const genTokenAsync = payload => new Promise((resolve, reject) => {
  return sign(payload, process.env.JWT_SECRET, ((err, encoded) => {
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
