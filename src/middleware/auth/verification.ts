import { getUserByEmail, getUserByVerificationToken,
  updateUserEmailVerificationToken } from 'controllers/user'
import { emitRouterError } from 'lib/errors'
import { sendVerificationEmail } from 'services/auth/sendVerificationEmail'
const addSeconds = require('date-fns/add_seconds')
const uuidv4 = require('uuid/v4')

export const sendVerification = async ctx => {
  const { email } = ctx.request.body

  try {
    const { emailVerified, id, name } = await getUserByEmail(email)

    if (!emailVerified) {
      const emailVerificationToken = uuidv4()
      const emailVerificationTokenExpiration = addSeconds(new Date(), process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION)

      await updateUserEmailVerificationToken({
        emailVerificationToken,
        emailVerificationTokenExpiration,
        id
      })

      await sendVerificationEmail(email, name, emailVerificationToken)
      ctx.body = `Verification email sent!`
      ctx.status = 200
    } else {
      ctx.body = `Email already verified.`
      ctx.status = 400
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
}

export const verifyEmail = async ctx => {
  const { token } = ctx.request.query

  try {
    const { emailVerified, emailVerificationToken, emailVerificationTokenExpiration, 
      id } = await getUserByVerificationToken(token)

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
