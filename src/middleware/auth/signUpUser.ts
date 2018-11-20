import { Connection } from 'typeorm'
import { isEmail } from 'validator'
import { User } from 'entities'
import { CustomStatusError, emitRouterError } from 'lib/errors'
import { createUser } from 'controllers/user'
import { sendVerificationEmail } from 'services/auth/sendVerificationEmail'
const addSeconds = require('date-fns/add_seconds')
const uuidv4 = require('uuid/v4')

const emailExists = async (conn: Connection, email) => {
  const user = await conn.getRepository(User).findOne({ email })
  return !!user
}

export const validEmail = async (ctx, next) => {
  if (!isEmail(ctx.request.body.email)) {
    emitRouterError(new CustomStatusError('Email is invalid.').BadRequest(), ctx)
    return
  }

  await next()
}

export const emailNotExists = async (ctx, next) => {

  if (await emailExists(ctx.db, ctx.request.body.email)) {
    emitRouterError(new CustomStatusError('Email is already signed up.').BadRequest(), ctx)
    return
  }

  await next()
}

export const signUpUser = async (ctx, next) => {
  const expirationDate = addSeconds(new Date(), process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION)
  const token = uuidv4()

  const user = {
    email: ctx.request.body.email,
    emailVerified: false,
    emailVerificationToken: token,
    emailVerificationTokenExpiration: expirationDate,
    name: ctx.request.body.name,
    password: ctx.request.body.password
  }

  try {
    const { id, email, emailVerificationToken, name } = await createUser(user)

    await sendVerificationEmail(email, name, emailVerificationToken)

    ctx.body = { id, email }
    next()
  } catch (error) {
    emitRouterError(error, ctx)
  }
}
