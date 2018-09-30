import { getUserByEmail, getUserByResetPasswordToken, updateUser,
  updateUserPassword } from 'controllers/user'
import { emitRouterError } from "lib/errors";
import { sendResetPasswordEmail } from 'services/auth/sendResetPasswordEmail'
const addSeconds = require('date-fns/add_seconds')
const uuidv4 = require('uuid/v4')

export const resetPassword = async ctx => {
  const { password, resetPasswordToken } = ctx.request.body

  try {
    const { id, resetPasswordTokenExpiration } = await getUserByResetPasswordToken(resetPasswordToken)

    if (resetPasswordTokenExpiration < new Date()) {
      ctx.body = `Email verification code has expired.`
      ctx.status = 400
    } else {      
      await updateUserPassword({
        id,
        password,
        resetPasswordToken: null,
        resetPasswordTokenExpiration: null
      })

      ctx.body = 'Password reset successful.'
      ctx.status = 200
    }
  } catch (error) {    
    emitRouterError(error, ctx)
  }
}

export const sendResetPassword = async ctx => {
  const { email } = ctx.request.body

  try {
    const { id, name } = await getUserByEmail(email)

    const resetPasswordToken = uuidv4()
    const resetPasswordTokenExpiration = addSeconds(new Date(), process.env.RESET_PASSWORD_TOKEN_EXPIRATION)

    await updateUser({
      id,
      resetPasswordToken,
      resetPasswordTokenExpiration
    })

    await sendResetPasswordEmail(email, name, resetPasswordToken)
    
    ctx.body = 'Reset password email sent!'
    ctx.status = 200
  } catch (error) {
    emitRouterError(error, ctx)
  }
}