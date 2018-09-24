import { sign } from 'jsonwebtoken'

export const delimitQueryValues = (ctx, keys) => {
  let query = ctx.request.query
  for (const key of keys) {
    if (query[key]) {
      query[key] = query[key].split(',')
    }
  }
  ctx.request.query = query
  return ctx
}

export const chunkArray = (arr, chunkSize = 10) => {
  let i
  let j
  let chunks = []
  for (i = 0, j = arr.length; i < j; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }
  return chunks
}

export const logError = (msg, error, data = {}) => {
  if (msg) {
    console.error(msg)
  }

  for (const key of Object.keys(data)) {
    console.error(`${key} ${data[key]}`)
  }

  if (error) {
    console.error(error)
  }
}

export const offsetDate = (minutesOffset = 0) => {
  let todayDate = new Date()
  todayDate.setMinutes((todayDate.getMinutes() - todayDate.getTimezoneOffset()) + minutesOffset)
  return todayDate.toISOString().slice(0, 10)
}

// NOTE: I am manually offsetting by 5 hours since the server is in UTC but the
// Google Analytics data is in CST.
// This WILL cause a problem when DST happens.
export const lastHour = () => {
  let todayDate = new Date()
  todayDate.setMinutes((todayDate.getMinutes() - todayDate.getTimezoneOffset()) - 300 - 60)
  let lastHour = todayDate.toISOString().slice(11, 13)
  return parseInt(lastHour, 10)
}

const genTokenAsync = payload => new Promise((resolve, reject) => {
  sign(payload, process.env.JWT_SECRET, ((err, encoded) => {
    if (err) return reject(err)
    resolve(encoded)
  }))
})

export async function generateToken ({ uuid, roles }) {
  const exp = Math.floor(Date.now() / 1000) + (60 * 60)
  const token = await genTokenAsync({ uuid, roles, exp })
  return { token, exp }
}

import * as passwordValidator from 'password-validator'

const schema = new passwordValidator()

const validatePasswordSchema = schema
  .is().min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces()

export const validatePassword = password => {
  return validatePasswordSchema.validate(password)
}
