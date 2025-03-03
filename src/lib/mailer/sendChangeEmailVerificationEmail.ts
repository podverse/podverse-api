import { logError, logger } from 'podverse-helpers';
import { config } from '@api/config';
import { emailTemplate } from '@api/lib/mailer/emailTemplate';
import { createTransporter } from '@api/lib/mailer/transporter';

export const sendEmailChangeVerificationEmail = async (pending_email_address: string, token: string): Promise<void> => {
  if (config.mailer.disabled) {
    logger.info('Mailer has been disabled, email change verification email will be skipped');
    return Promise.resolve();
  }

  if (!config.mailer.host) {
    logError('Mailer host is not configured, email change verification email will be skipped');
    return Promise.resolve();
  }

  const transporter = createTransporter();

  const emailFields = {
    buttonLink: `${config.web.protocol}://${config.web.domain}${config.emailChangeVerification.pagePath}${token}`,
    buttonText: 'Verify Email Change',
    closing: '',
    headerText: 'Verify your change of email',
    paragraphText: `Are you SURE you want to change your email address to ${pending_email_address}? Please click the button below to complete your email change.`,
    unsubscribeLink: ''
  };

  await transporter.sendMail({
    from: `Podverse <${config.mailer.from}>`,
    to: pending_email_address,
    subject: 'Verify your change of email with Podverse',
    html: emailTemplate(emailFields),
    text: `Verify your email change request by visiting the following: ${emailFields.buttonLink}`
  });
};