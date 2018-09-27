import { Connection } from 'typeorm'
import { isEmail } from 'validator'
import { User } from 'entities'
import { CustomStatusError, emitRouterError } from 'lib/errors'
import { createUser } from 'controllers/user'
import { sendVerificationEmail } from 'services/auth/verifyEmail';

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
    emitRouterError(new CustomStatusError('The user already exists.').BadRequest(), ctx)
    return
  }

  await next()
}

export const registerUser = async (ctx, next) => {
  const user = {
    email: ctx.request.body.email,
    emailVerified: false,
    password: ctx.request.body.password
  }

  try {
    const { id, email, emailVerificationToken } = await createUser(user)

    await sendVerificationEmail(email, emailVerificationToken)

    ctx.body = { id, email }
    next()
  } catch (error) {
    emitRouterError(error, ctx)
  }
}
