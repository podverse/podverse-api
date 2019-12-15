import { config } from '~/config'

export const emailTemplate = (obj) => {
  const { buttonLink, buttonText, headerText, paragraphText, unsubscribeLink } = obj

  return `
    <!doctype html>

    <html lang="en">

      <head>
        <meta charset="utf-8">
        <title>Podverse</title>
      </head>

      <body style="margin: 0; padding: 0;">
        <div class="container" style="background-color: #D8D8D8; font-family: 'Arial', sans-serif; margin: 0; padding: 0 0 32px 0;">
          <div class="nav" style="background-color: ${config.emailBrandColor}; height: 58px; text-align: center; width: 100%;">
            ${config.emailHeaderImageUrl ? `<img src="${config.emailHeaderImageUrl}" style="height: 38px; margin-top: 10px; max-width: 280px;" />` : ''}
          </div>
          <div class="content" style="background-color: #FFF; margin: 40px auto; max-width: 380px; padding: 40px 40px 48px 40px;">
            ${headerText ? `<h1 style="color: ${config.emailBrandColor}; font-size: 30px; margin: 0 0 32px 0; text-align: center;">${headerText}</h1>` : ''}
            ${paragraphText ? `<p style="color: #000; font-size: 14px; margin: 0 0 32px 0; text-align: center;">${paragraphText}</p>` : ''}
            ${buttonLink && buttonText ? `<a class="button" href="${buttonLink}" style="background-color: ${config.emailBrandColor}; border-radius: 100px; color: #FFF; display: block; font-size: 14px; height: 40px; line-height: 40px; text-align: center; text-decoration: none; width: 100%;">${buttonText}</a>` : ''}
          </div>
          <div class="footer">
            ${socialIcons}
            ${addressSection}
            ${unsubscribeLink ? `
              <a class="unsubscribe" href="${unsubscribeLink}" style="color: #555; display: block; font-size: 12px; margin: 32px 0 0 0; text-align: center; text-decoration: none;">Unsubscribe</a>
            ` : ''}
          </div>
        </div>
      </body>

    </html>
  `
}

const addressSection = config.legalName || config.legalAddress ? `
  <div class="address" style="color: #555; font-size: 14px; line-height: 20px; margin: 0; text-align: center;">
    ${config.legalName}
    ${config.legalName && config.legalAddress ? '<br />' : ''}
    ${config.legalAddress}
  </div>
` : ''

const facebookIcon = config.socialFacebookImageUrl && config.socialFacebookPageUrl ? `
  <a class="social-icon" href="${config.socialFacebookPageUrl}" style="display: inline-block; height: 32px; margin: 0 16px; width: 32px;">
    <img src="${config.socialFacebookImageUrl}" style="height: 32px; width: 32px;" />
  </a>
` : ''

const githubIcon = config.socialGithubImageUrl && config.socialGithubPageUrl ? `
  <a class="social-icon" href="${config.socialGithubPageUrl}" style="display: inline-block; height: 32px; margin: 0 16px; width: 32px;">
    <img src="${config.socialGithubImageUrl}" style="height: 32px; width: 32px;" />
  </a>
` : ''

const redditIcon = config.socialRedditImageUrl && config.socialRedditPageUrl ? `
  <a class="social-icon" href="${config.socialRedditPageUrl}" style="display: inline-block; height: 32px; margin: 0 16px; width: 32px;">
    <img src="${config.socialRedditImageUrl}" style="height: 32px; width: 32px;" />
  </a>
` : ''

const twitterIcon = config.socialTwitterImageUrl && config.socialTwitterPageUrl ? `
  <a class="social-icon" href="${config.socialTwitterPageUrl}" style="display: inline-block; height: 32px; margin: 0 16px; width: 32px;">
    <img src="${config.socialTwitterImageUrl}" style="height: 32px; width: 32px;" />
  </a>
` : ''

const socialIcons = config.socialFacebookPageUrl
  || config.socialGithubPageUrl
  || config.socialRedditPageUrl
  || config.socialTwitterPageUrl ? `
  <div class="social-icons" style="margin: 36px 32px 28px 32px; text-align: center;">
    ${facebookIcon}
    ${githubIcon}
    ${redditIcon}
    ${twitterIcon}
  </div>
` : ''
