import createError from 'http-errors'
import { config } from 'config'
import { createTransporter } from 'services/mailer'
import { emailTemplate } from 'lib/emailTemplate'
import { convertSecondsToDaysText } from 'lib/utility';

const { resetPasswordTokenExpiration } = config

export const sendResetPasswordEmail = async (email, name, token) => {
  const transporter = createTransporter()
  const daysToExpire = convertSecondsToDaysText(resetPasswordTokenExpiration)

  const emailFields = {
    preheader: '',
    greeting: `${name ? `Hi ${name},` : ''}`,
    topMessage: `Please click the button below to reset your password.`,
    button: 'Reset Password',
    buttonLink: `${config.websiteProtocol}://${config.websiteDomain}${config.websiteResetPasswordPagePath}${token}`,
    bottomMessage: `This link will expire in ${daysToExpire }.`,
    closing: '',
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
