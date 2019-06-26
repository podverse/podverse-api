import { Connection } from 'typeorm'
import { isEmail } from 'validator'
import { config } from '~/config'
import { User } from '~/entities'
import { authExpires } from '~/lib/constants'
import { CustomStatusError, emitRouterError } from '~/lib/errors'
import { createUser } from '~/controllers/user'
import { generateToken } from '~/services/auth'
import { sendVerificationEmail } from '~/services/auth/sendVerificationEmail'
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

  const emailVerificationExpiration = addSeconds(new Date(), process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION)
  const freeTrialExpiration = addSeconds(new Date(), process.env.FREE_TRIAL_EXPIRATION)
  const emailVerificationToken = uuidv4()

  const user = {
    email: ctx.request.body.email,
    emailVerified: false,
    emailVerificationToken,
    emailVerificationTokenExpiration: emailVerificationExpiration,
    freeTrialExpiration,
    name: ctx.request.body.name,
    password: ctx.request.body.password,
    queueItems: ctx.request.body.queueItems || []
  }

  try {
    const { id, email, emailVerificationToken, name } = await createUser(user)

    await sendVerificationEmail(email, name, emailVerificationToken)

    const bearerToken = await generateToken({ id })

    const expires = authExpires()

    ctx.body = {
      id,
      email
    }

    if (ctx.query.includeBodyToken) {
      ctx.body.token = `Bearer ${bearerToken}`
    } else {
      ctx.cookies.set('Authorization', `Bearer ${bearerToken}`, {
        domain: config.cookieDomain,
        expires,
        httpOnly: true,
        overwrite: true,
        secure: config.cookieIsSecure
      })
    }

    ctx.status = 200

    next()
  } catch (error) {
    emitRouterError(error, ctx)
  }
}
