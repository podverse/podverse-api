import { config } from '~/config'
import { createTransporter } from '~/services/mailer'
import { emailTemplate } from '~/lib/emailTemplate'
const createError = require('http-errors')

const { mailerUsername } = config

export const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter()

  const emailFields = {
    preheader: 'Hello podcast fan,',
    greeting: `Thank you for signing up for Podverse.fm!`,
    topMessage: 'Please click the button below to verify your email address.',
    button: 'Verify Email',
    buttonLink: `${config.websiteProtocol}://${config.websiteDomain}${config.websiteVerifyEmailPagePath}${token}`,
    bottomMessage: `We will never send emails or share your data without your permission.`,
    closing: 'Have a nice day :)',
    name: '',
    address: '',
    unsubscribeLink: '',
    buttonColor: '#2968B1'
  }

  try {
    await transporter.sendMail({
      from: `Podverse <${mailerUsername}>`,
      to: email,
      subject: 'Verify your Podverse account',
      html: emailTemplate(emailFields)
    })
  } catch (error) {
    throw new createError.InternalServerError(error)
  }
}
