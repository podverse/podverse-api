import { config } from '~/config'
import { createTransporter } from '~/services/mailer'
import { emailTemplate } from '~/lib/emailTemplate'
import { convertSecondsToDaysText } from '~/lib/utility'
import { loggerInstance } from '~/lib/logging'
import createError from 'http-errors'

export const sendResetPasswordEmail = async (email, name, token): Promise<void> => {
  if (config.mailer.disabled) {
    loggerInstance.debug('Mailer has been disabled, password reset email will be skipped')
    return Promise.resolve()
  }

  if (!config.mailer.host) {
    loggerInstance.error('Mailer host is not configured, password reset email will be skipped')
    return Promise.resolve()
  }

  const transporter = createTransporter()
  const daysToExpire = convertSecondsToDaysText(config.resetPasswordTokenExpiration)

  const emailFields = {
    buttonLink: `${config.website.protocol}://${config.website.domain}${config.website.resetPasswordPagePath}${token}`,
    buttonText: 'Reset Password',
    closing: '',
    headerText: 'Reset your Podverse password',
    paragraphText: `Please click the button below to reset your Podverse password. This link will expire in ${daysToExpire}.`,
    unsubscribeLink: ''
  }

  try {
    await transporter.sendMail({
      from: `Podverse <${config.mailer.from}>`,
      to: email,
      subject: 'Reset your Podverse password',
      html: emailTemplate(emailFields),
      text: `Reset your Podverse password by visiting the following: ${emailFields.buttonLink}`
    })
  } catch (error) {
    throw new createError.InternalServerError(error)
  }
}
