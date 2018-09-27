import { getUser, updateUser } from 'controllers/user'
import { emitRouterError } from 'lib/errors'

export const sendVerificationEmail = async ctx => {
  const { id } = ctx.request.body

  try {
    const { emailVerified } = await getUser(id)

    if (!emailVerified) {
      // send verfication email
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

export const verifyUser = async ctx => {
  const { id, code } = ctx.params

  try {
    const { email, emailVerificationCode } = await getUser(id)

    if (emailVerificationCode && code && code === emailVerificationCode) {
      const user = await updateUser({
        emailVerified: true,
        emailVerificationCode: null
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
