import { config } from '@api/config';
import { loggerService } from '@api/factories/loggerService';
import { emailTemplate } from '@api/lib/mailer/emailTemplate';
import { createTransporter } from '@api/lib/mailer/transporter';

export const sendEmailChangeVerificationEmail = async (pending_email_address: string, token: string): Promise<void> => {
  if (config.mailer.disabled) {
    loggerService.info('Mailer has been disabled, email change verification email will be skipped');
    return;
  }

  if (!config.mailer.host) {
    loggerService.logError('Mailer host is not configured, email change verification email will be skipped');
    return;
  }

  let transporter;
  try {
    transporter = createTransporter();
  } catch (err) {
    console.error('[sendEmailChangeVerificationEmail] failed to create transporter', err);
    throw err;
  }

  const emailFields = {
    buttonLink: `${config.web.protocol}://${config.web.domain}${config.emailChangeVerification.pagePath}${token}`,
    buttonText: 'Verify Email Change',
    closing: '',
    headerText: 'Verify your change of email',
    paragraphText: `Are you sure you want to change your email address to ${pending_email_address}? Please click the button below to complete your email change.`,
    unsubscribeLink: ''
  };

  try {
    await transporter.sendMail({
      from: `Podverse <${config.mailer.from}>`,
      to: pending_email_address,
      subject: 'Verify your change of email with Podverse',
      html: emailTemplate(emailFields),
      text: `Verify your email change request by visiting the following: ${emailFields.buttonLink}`
    });
  } catch (err) {
    console.error('[sendEmailChangeVerificationEmail] mail send failed', err);
    throw err;
  }
};