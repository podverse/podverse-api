import { config } from '@api/config';

type EmailTemplateParams = {
  buttonLink?: string;
  buttonText?: string;
  headerText?: string;
  paragraphText?: string;
  unsubscribeLink?: string;
};

export const emailTemplate = ({ buttonLink, buttonText, headerText, paragraphText, unsubscribeLink }: EmailTemplateParams) => `
  <!doctype html>
  <html lang="en-US">
    <head>
      <meta charset="utf-8">
      <title>Podverse</title>
    </head>
    <body style="margin: 0; padding: 0;">
      <div class="container" style="background-color: #D8D8D8; font-family: 'Arial', sans-serif; margin: 0; padding: 0 0 32px 0;">
        <div class="nav" style="background-color: ${config.email.styles.brandColor}; height: 58px; text-align: center; width: 100%;">
          ${config.email.header.imagueUrl ? `<img src="${config.email.header.imagueUrl}" style="height: 38px; margin-top: 10px; max-width: 280px;" />` : ''}
        </div>
        <div class="content" style="background-color: #FFF; margin: 40px auto; max-width: 380px; padding: 40px 40px 48px 40px;">
          ${headerText ? `<h1 style="color: ${config.email.styles.brandColor}; font-size: 30px; margin: 0 0 32px 0; text-align: center;">${headerText}</h1>` : ''}
          ${paragraphText ? `<p style="color: #000; font-size: 14px; margin: 0 0 32px 0; text-align: center;">${paragraphText}</p>` : ''}
          ${buttonLink && buttonText ? `<a class="button" href="${buttonLink}" style="background-color: ${config.email.styles.brandColor}; border-radius: 100px; color: #FFF; display: block; font-size: 14px; height: 40px; line-height: 40px; text-align: center; text-decoration: none; width: 100%;">${buttonText}</a>` : ''}
        </div>
        <div class="footer">
          ${socialIcons};
          ${addressSection};
          ${unsubscribeLink ? `<a class="unsubscribe" href="${unsubscribeLink}" style="color: #555; display: block; font-size: 12px; margin: 32px 0 0 0; text-align: center; text-decoration: none;">Unsubscribe</a>` : ''}
        </div>
      </div>
    </body>
  </html>
`;

const addressSection = config.legal.name || config.legal.address ? `
  <div class="address" style="color: #555; font-size: 14px; line-height: 20px; margin: 0; text-align: center;">
    ${config.legal.name}
    ${config.legal.name && config.legal.address ? '<br />' : ''}
    ${config.legal.address}
  </div>
` : '';

const socialIconTemplate = (imageUrl: string, pageUrl: string) => imageUrl && pageUrl ? `
  <a class="social-icon" href="${pageUrl}" style="display: inline-block; height: 32px; margin: 0 16px; width: 32px;">
    <img src="${imageUrl}" style="height: 32px; width: 32px;" />
  </a>
` : '';

const facebookIcon = socialIconTemplate(config.social.facebook.imageUrl, config.social.facebook.pageUrl);
const githubIcon = socialIconTemplate(config.social.github.imageUrl, config.social.github.pageUrl);
const redditIcon = socialIconTemplate(config.social.reddit.imageUrl, config.social.reddit.pageUrl);
const twitterIcon = socialIconTemplate(config.social.twitter.imageUrl, config.social.twitter.pageUrl);

const socialIcons = config.social.facebook.pageUrl || config.social.github.pageUrl || config.social.reddit.pageUrl || config.social.twitter.pageUrl ? `
  <div class="social-icons" style="margin: 36px 32px 28px 32px; text-align: center;">
    ${facebookIcon}
    ${githubIcon}
    ${redditIcon}
    ${twitterIcon}
  </div>
` : '';
