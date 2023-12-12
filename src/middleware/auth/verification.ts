import { addSeconds } from 'date-fns'
import { getUserByEmail, getUserByVerificationToken, updateUserEmailVerificationToken } from 'podverse-orm'
import { v4 as uuidv4 } from 'uuid'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { sendVerificationEmail } from '~/services/auth/sendVerificationEmail'

export const sendVerification = async (ctx, email) => {
  try {
    const user = await getUserByEmail(email)
    const { emailVerified, id, name } = user
    if (!emailVerified) {
      const emailVerificationToken = uuidv4()
      const emailVerificationTokenExpiration = addSeconds(new Date(), config.emailVerificationTokenExpiration)
      await updateUserEmailVerificationToken({
        emailVerified,
        emailVerificationToken,
        emailVerificationTokenExpiration,
        id
      })
      await sendVerificationEmail(email, name, emailVerificationToken)
      ctx.body = {
        message: `If that email exists in our system, a verification email should arrive in your inbox shortly.`
      }
      ctx.status = 200
    }
  } catch (error) {
    console.log('sendVerification:', error)
  }
  ctx.body = {
    message: `If that email exists in our system, a verification email should arrive in your inbox shortly.`
  }
  ctx.status = 200
}

export const verifyEmail = async (ctx) => {
  const { token } = ctx.request.query

  try {
    const { emailVerified, emailVerificationToken, emailVerificationTokenExpiration, id } =
      await getUserByVerificationToken(token)

    if (emailVerified) {
      ctx.body = `Email already verified.`
      ctx.status = 200
    } else if (emailVerificationTokenExpiration < new Date()) {
      ctx.body = `Email verification code has expired.`
      ctx.status = 401
    } else if (emailVerificationToken && token && token === emailVerificationToken) {
      await updateUserEmailVerificationToken({
        emailVerified: true,
        id
      })
      ctx.body = `Email successfully verified.`
      ctx.status = 200
    } else {
      ctx.body = `Invalid verification code.`
      ctx.status = 400
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
}
