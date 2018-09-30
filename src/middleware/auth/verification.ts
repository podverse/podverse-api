import { getUserByEmail, updateUser, getUserByVerificationToken } from 'controllers/user'
import { emitRouterError } from 'lib/errors'
import { sendVerificationEmail } from 'services/auth/sendVerificationEmail'
const addSeconds = require('date-fns/add_seconds')
const uuidv4 = require('uuid/v4')

export const sendVerification = async ctx => {
  const { email } = ctx.request.body

  try {
    const { emailVerified, id } = await getUserByEmail(email)

    if (!emailVerified) {
      const emailVerificationToken = uuidv4()
      const emailVerificationTokenExpiration = addSeconds(new Date(), process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION)
      
      const updatedUser = await updateUser({
        emailVerificationToken,
        emailVerificationTokenExpiration,
        id
      })

      await sendVerificationEmail(email, emailVerificationToken)
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
    const { email, emailVerified, emailVerificationToken, id } = await getUserByVerificationToken(token)

    if (emailVerified) {
      ctx.body = `Email already verified. Thank you, have a nice day!`
      ctx.status = 200
    } else if (emailVerificationToken && token && token === emailVerificationToken) {
      await updateUser({
        emailVerified: true,
        emailVerificationCode: null,
        id
      })
      ctx.body = `Email successfully verified. Thank you, have a nice day!`
      ctx.status = 200
    } else {
      ctx.body = `Invalid verification code.`
      ctx.status = 400
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
}
