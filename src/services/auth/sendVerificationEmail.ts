import { config } from '~/config'
import { emailTemplate } from '~/lib/emailTemplate'
import { loggerInstance } from '~/lib/logging'
import { createTransporter } from '~/services/mailer'
import createError from 'http-errors'

export const sendVerificationEmail = async (email, name, token): Promise<void> => {
  if (config.mailer.disabled) {
    loggerInstance.debug('Mailer has been disabled, verification email will be skipped')
    return Promise.resolve()
  }

  if (!config.mailer.host) {
    loggerInstance.error('Mailer host is not configured, verification email will be skipped')
    return Promise.resolve()
  }

  const transporter = createTransporter()

  const emailFields = {
    buttonLink: `${config.website.protocol}://${config.website.domain}${config.website.verifyEmailPagePath}${token}`,
    buttonText: 'Verify Email',
    closing: '',
    headerText: 'Verify your email',
    paragraphText: 'Please click the button below to finish verification.',
    unsubscribeLink: ''
  }

  try {
    await transporter.sendMail({
      from: `Podverse <${config.mailer.from}>`,
      to: email,
      subject: 'Verify your email address with Podverse',
      html: emailTemplate(emailFields),
      text: `Verify your email by visiting the following: ${emailFields.buttonLink}`
    })
  } catch (error) {
    loggerInstance.error(error)
    throw new createError.InternalServerError(error)
  }
}
