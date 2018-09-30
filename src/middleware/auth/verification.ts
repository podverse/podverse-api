import { uuidv4 } from 'uuid'
import { getUser, updateUser, getUserByVerificationToken } from 'controllers/user'
import { emitRouterError } from 'lib/errors'
import { sendVerificationEmail } from 'services/auth/sendVerificationEmail'
const addSeconds = require('date-fns/add_seconds')

export const sendVerification = async ctx => {
  const { id } = ctx.request.body

  try {
    const { email, emailVerified } = await getUser(id)

    if (!emailVerified) {
      const emailVerificationToken = uuidv4()
      const emailVerificationTokenExpiration = addSeconds(new Date(), process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION)

      await updateUser({
        emailVerificationToken,
        emailVerificationTokenExpiration
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
    const { email, emailVerificationToken, id } = await getUserByVerificationToken(token)

    if (emailVerificationToken && token && token === emailVerificationToken) {
      await updateUser({
        emailVerified: true,
        emailVerificationCode: null,
        id
      })
      ctx.body = `Email successfully verified for ${email}. Thank you, have a nice day!`
      ctx.status = 200
    } else {
      ctx.body = `Invalid verification code.`
      ctx.status = 400
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
}
