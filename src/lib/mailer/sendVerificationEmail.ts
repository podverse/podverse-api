import { config } from '@api/config';
import { loggerService } from '@api/factories/loggerService';
import { emailTemplate } from '@api/lib/mailer/emailTemplate';
import { createTransporter } from '@api/lib/mailer/transporter';

export const sendVerificationEmail = async (email: string, name: string, token: string): Promise<void> => {
  if (config.mailer.disabled) {
    loggerService.info('Mailer has been disabled, verification email will be skipped');
    return Promise.resolve();
  }

  if (!config.mailer.host) {
    loggerService.logError('Mailer host is not configured, verification email will be skipped');
    return Promise.resolve();
  }

  const transporter = createTransporter();

  const emailFields = {
    buttonLink: `${config.web.protocol}://${config.web.domain}${config.verifyEmail.pagePath}${token}`,
    buttonText: 'Verify Email',
    closing: '',
    headerText: 'Verify your email',
    paragraphText: 'Please click the button below to finish verification.',
    unsubscribeLink: ''
  };

  await transporter.sendMail({
    from: `Podverse <${config.mailer.from}>`,
    to: email,
    subject: 'Verify your email address with Podverse',
    html: emailTemplate(emailFields),
    text: `Verify your email by visiting the following: ${emailFields.buttonLink}`
  });
};
