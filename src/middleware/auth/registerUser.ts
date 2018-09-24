import { Connection } from 'typeorm'
import { isEmail } from 'validator'
import { User } from 'entities'
import { CustomStatusError, emitRouterError } from 'lib/errors'

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
