import { config } from '@api/config';
import { loggerService } from '@api/factories/loggerService';
import { emailTemplate } from '@api/lib/mailer/emailTemplate';
import { createTransporter } from '@api/lib/mailer/transporter';

export const sendVerificationEmail = async (email: string, name: string, token: string): Promise<void> => {
  console.log('[sendVerificationEmail] start', {
    email,
    name,
    tokenPreview: token?.slice(0, 8),
    mailerDisabled: config.mailer.disabled
  });

  if (config.mailer.disabled) {
    console.log('[sendVerificationEmail] mailer disabled, skipping');
    loggerService.info('Mailer has been disabled, verification email will be skipped');
    return Promise.resolve();
  }

  if (!config.mailer.host) {
    console.log('[sendVerificationEmail] missing mailer host, skipping');
    loggerService.logError('Mailer host is not configured, verification email will be skipped');
    return Promise.resolve();
  }

  let transporter;
  try {
    transporter = createTransporter();
    console.log('[sendVerificationEmail] transporter created');
  } catch (err) {
    console.error('[sendVerificationEmail] failed to create transporter', err);
    throw err;
  }

  const emailFields = {
    buttonLink: `${config.web.protocol}://${config.web.domain}${config.verifyEmail.pagePath}${token}`,
    buttonText: 'Verify Email',
    closing: '',
    headerText: 'Verify your email',
    paragraphText: 'Please click the button below to finish verification.',
    unsubscribeLink: ''
  };

  console.log('[sendVerificationEmail] emailFields prepared', {
    buttonLink: emailFields.buttonLink,
    to: email
  });

  try {
    console.log('[sendVerificationEmail] sending mail');
    await transporter.sendMail({
      from: `Podverse <${config.mailer.from}>`,
      to: email,
      subject: 'Verify your email address with Podverse',
      html: emailTemplate(emailFields),
      text: `Verify your email by visiting the following: ${emailFields.buttonLink}`
    });
    console.log('[sendVerificationEmail] mail send success');
  } catch (err) {
    console.error('[sendVerificationEmail] mail send failed', err);
    throw err;
  }

  console.log('[sendVerificationEmail] end');
};
