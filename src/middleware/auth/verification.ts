import { getUser, updateUser, getUserByVerificationToken } from 'controllers/user'
import { emitRouterError } from 'lib/errors'
import { sendVerificationEmail } from 'services/auth/verifyEmail'

export const sendVerification = async ctx => {
  const { id } = ctx.request.body

  try {
    const { email, emailVerificationToken, emailVerified } = await getUser(id)

    if (emailVerified) {
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
