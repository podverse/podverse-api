import createError from 'http-errors'
import { config } from 'config'
import { createTransporter } from 'services/mailer'
import { emailTemplate } from 'lib/emailTemplate'
import { convertSecondsToDaysText } from 'lib/utility';

export const sendResetPasswordEmail = async (email, name, token) => {
  const transporter = createTransporter()
  const daysToExpire = convertSecondsToDaysText(parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRATION))

  const emailFields = {
    preheader: '',
    greeting: `Hello${name ? ` ${name},` : ','}`,
    topMessage: `To reset your Podverse password, please click the button below.`,
    button: 'Reset Password',
    buttonLink: `${config.apiHost}/auth/reset-password?token=${token}`,
    bottomMessage: `This link will expire in ${daysToExpire }.`,
    closing: 'Have a nice day :)',
    name: 'Podverse',
    address: '',
    unsubscribeLink: '',
    buttonColor: '#2968B1'
  }

  try {
    await transporter.sendMail({
      from: process.env.MAILER_USERNAME,
      to: email,
      subject: 'Reset your Podverse password',
      html: emailTemplate(emailFields)
    })
  } catch (error) {
    throw new createError.InternalServerError(error)
  }
}
