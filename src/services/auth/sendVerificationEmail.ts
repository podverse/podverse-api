import { config } from '~/config'
import { createTransporter } from '~/services/mailer'
import { emailTemplate } from '~/lib/emailTemplate'
const createError = require('http-errors')

const { mailerFrom } = config

export const sendVerificationEmail = async (email, name, token) => {
  if (process.env.NODE_ENV === 'production') {
    const transporter = createTransporter()
  
    const emailFields = {
      buttonLink: `${config.websiteProtocol}://${config.websiteDomain}${config.websiteVerifyEmailPagePath}${token}`,
      buttonText: 'Verify Email',
      closing: '',
      headerText: 'Verify your email',
      paragraphText: 'Please click the button below to finish verification.',
      unsubscribeLink: ''
    }
  
    try {
      await transporter.sendMail({
        from: `Podverse <${mailerFrom}>`,
        to: email,
        subject: 'Verify your email address with Podverse',
        html: emailTemplate(emailFields)
      })
  
    } catch (error) {
      throw new createError.InternalServerError(error)
    }
  }
}
