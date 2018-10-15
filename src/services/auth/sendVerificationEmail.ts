import createError from 'http-errors'
import { config } from 'config'
import { createTransporter } from 'services/mailer'
import { emailTemplate } from 'lib/emailTemplate'

const { mailerUsername } = config

export const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter()

  const emailFields = {
    preheader: '',
    greeting: `Hello${name ? ` ${name},` : ','}`,
    topMessage: 'To verify your email, please click the button below.',
    button: 'Verify Email',
    buttonLink: `${config.apiHost}${config.apiPrefix}${config.apiVersion}/auth/verify-email?token=${token}`,
    bottomMessage: 'We will never send you emails without your permission or share your email with 3rd parties.',
    closing: 'Have a nice day :)',
    name: 'Podverse',
    address: '',
    unsubscribeLink: '',
    buttonColor: '#2968B1'
  }

  try {
    await transporter.sendMail({
      from: mailerUsername,
      to: email,
      subject: 'Verify your Podverse account',
      html: emailTemplate(emailFields)
    })
  } catch (error) {
    throw new createError.InternalServerError(error)
  }
}
