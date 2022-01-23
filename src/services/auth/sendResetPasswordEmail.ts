import { config } from '~/config'
import { createTransporter } from '~/services/mailer'
import { emailTemplate } from '~/lib/emailTemplate'
import { convertSecondsToDaysText } from '~/lib/utility'
const createError = require('http-errors')

const { mailerFrom, resetPasswordTokenExpiration } = config

export const sendResetPasswordEmail = async (email, name, token) => {
  const transporter = createTransporter()
  const daysToExpire = convertSecondsToDaysText(resetPasswordTokenExpiration)

  const emailFields = {
    buttonLink: `${config.websiteProtocol}://${config.websiteDomain}${config.websiteResetPasswordPagePath}${token}`,
    buttonText: 'Reset Password',
    closing: '',
    headerText: 'Reset your Podverse password',
    paragraphText: `Please click the button below to reset your Podverse password. This link will expire in ${daysToExpire}.`,
    unsubscribeLink: ''
  }

  try {
    await transporter.sendMail({
      from: `Podverse <${mailerFrom}>`,
      to: email,
      subject: 'Reset your Podverse password',
      html: emailTemplate(emailFields)
    })
  } catch (error) {
    throw new createError.InternalServerError(error)
  }
}
