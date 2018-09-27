import createError from 'http-errors'
import { config } from 'config'
import { createTransporter } from 'services/mailer'
import { emailTemplate } from 'lib/emailTemplate'

export const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter()

  const emailFields = {
    greeting: 'Hello!',
    topMessage: 'To verify your account, please click the button below.',
    button: 'Verify Email',
    buttonLink: `${config.apiHost}${config.apiPrefix}${config.apiVersion}/auth/verify-email?token=${token}`,
    bottomMessage: 'It\'s not required for you to sign in, but we may add extra features for verified accounts in the future.',
    closing: 'Have a nice day :)',
    name: 'Podverse',
    address: null,
    unsubscribeLink: null,
    buttonColor: '#2968B1'
  }

  try {
    await transporter.sendMail({
      from: process.env.MAILER_USERNAME,
      to: email,
      subject: 'Verify your Podverse account',
      html: emailTemplate(emailFields)
    })
  } catch (error) {
    throw new createError.InternalServerError(error)
  }
}
