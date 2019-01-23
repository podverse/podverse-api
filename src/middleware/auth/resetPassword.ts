import { getUserByEmail, getUserByResetPasswordToken,
  updateUserPassword, updateUserResetPasswordToken} from '~/controllers/user'
import { emitRouterError } from '~/lib/errors'
import { sendResetPasswordEmail } from '~/services/auth/sendResetPasswordEmail'
const addSeconds = require('date-fns/add_seconds')
const uuidv4 = require('uuid/v4')

export const resetPassword = async ctx => {
  const { password, resetPasswordToken } = ctx.request.body

  try {
    const { id, resetPasswordTokenExpiration } = await getUserByResetPasswordToken(resetPasswordToken)

    if (resetPasswordTokenExpiration < new Date()) {
      ctx.body = `Email verification code has expired.`
      ctx.status = 401
    } else if (id) {
      await updateUserPassword({
        id,
        password,
        resetPasswordToken: null,
        resetPasswordTokenExpiration: null
      })

      ctx.body = 'Password reset successful.'
      ctx.status = 200
    } else {
      ctx.body = `Invalid password reset token.`
      ctx.status = 401
    }
  } catch (error) {
    console.log(error)
    emitRouterError(error, ctx)
  }
}

export const sendResetPassword = async ctx => {
  const { email } = ctx.request.body

  try {
    const { id, name } = await getUserByEmail(email)

    const resetPasswordToken = uuidv4()
    const resetPasswordTokenExpiration = addSeconds(new Date(), process.env.RESET_PASSWORD_TOKEN_EXPIRATION)

    await updateUserResetPasswordToken({
      id,
      resetPasswordToken,
      resetPasswordTokenExpiration
    })

    await sendResetPasswordEmail(email, name, resetPasswordToken)
    ctx.body = 'A reset password email will be sent to this address if it exists in our system.'
    ctx.status = 200
  } catch (error) {
    ctx.body = 'A reset password email will be sent to this address if it exists in our system.'
    ctx.status = 200
  }
}