import { addSeconds } from 'date-fns'
import { createUser, getRepository, User } from 'podverse-orm'
import { v4 as uuidv4 } from 'uuid'
import isEmail from 'validator/lib/isEmail'
import { config } from '~/config'
import { CustomStatusError, emitRouterError } from '~/lib/errors'
import { sendVerificationEmail } from '~/services/auth/sendVerificationEmail'

const emailExists = async (email) => {
  const user = await getRepository(User).findOne({ email })
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
  if (await emailExists(ctx.request.body.email)) {
    emitRouterError(new CustomStatusError('Email is already signed up.').BadRequest(), ctx)
    return
  }

  await next()
}

export const signUpUser = async (ctx, next) => {
  const emailVerificationExpiration = addSeconds(new Date(), config.emailVerificationTokenExpiration)
  const freeTrialExpiration = addSeconds(new Date(), config.freeTrialExpiration)
  const emailVerificationToken = uuidv4()

  const user = {
    addByRSSPodcastFeedUrls: ctx.request.body.addByRSSPodcastFeedUrls || [],
    email: ctx.state.email,
    emailVerified: false,
    emailVerificationToken,
    emailVerificationTokenExpiration: emailVerificationExpiration,
    freeTrialExpiration,
    name: ctx.request.body.name,
    password: ctx.request.body.password,
    subscribedPodcastIds: ctx.request.body.subscribedPodcastIds || []
  }

  try {
    const { id, email, emailVerificationToken, name } = await createUser(user)
    await sendVerificationEmail(email, name, emailVerificationToken)

    ctx.body = {
      id,
      email
    }

    ctx.status = 200

    next()
  } catch (error) {
    emitRouterError(error, ctx)
  }
}
