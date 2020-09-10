import { addSeconds } from 'date-fns'
import { config } from '~/config'
import { getUserByEmail, getUserByResetPasswordToken,
  updateUserPassword, updateUserResetPasswordToken} from '~/controllers/user'
import { emitRouterError } from '~/lib/errors'
import { sendResetPasswordEmail } from '~/services/auth/sendResetPasswordEmail'
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

      ctx.body = { message: 'Password reset successful.' }
      ctx.status = 200
    } else {
      ctx.body = { message: `Invalid password reset token.` }
      ctx.status = 401
    }
  } catch (error) {
    emitRouterError(error, ctx)
  }
}

export const sendResetPassword = async ctx => {
  if (process.env.NODE_ENV === 'production') {
    const { email } = ctx.request.body
  
    try {
      const { id, name } = await getUserByEmail(email)
  
      const resetPasswordToken = uuidv4()
      const resetPasswordTokenExpiration = addSeconds(new Date(), config.resetPasswordTokenExpiration)
  
      await updateUserResetPasswordToken({
        id,
        resetPasswordToken,
        resetPasswordTokenExpiration
      })
  
      await sendResetPasswordEmail(email, name, resetPasswordToken)
      ctx.body = { message: 'A reset password email will be sent to this address if it exists in our system.' }
      ctx.status = 200
    } catch (error) {
      console.log('sendResetPasswordEmail error:', error)
      ctx.body = { message: 'A reset password email will be sent to this address if it exists in our system.' }
      ctx.status = 200
    }
  } else {
    ctx.body = { message: 'Development mode: sendResetPassword endpoint is disabled.' }
    ctx.status = 400
  }
}
