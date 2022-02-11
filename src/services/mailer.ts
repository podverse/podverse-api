const nodemailer = require('nodemailer')

export const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    requireTLS: process.env.NODE_ENV === 'production',
    auth: {
      user: process.env.MAILER_USERNAME,
      pass: process.env.MAILER_PASSWORD
    }
  })
}
