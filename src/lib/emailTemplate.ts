import { config } from '~/config'

export const emailTemplate = (obj) => {
  const { buttonLink, buttonText, headerText, paragraphText, unsubscribeLink } = obj

  return `
    <!doctype html>

    <html lang="en">

      <head>
        <meta charset="utf-8">
        <title>Podverse</title>
        <style>
          body {
            margin: 0;
            padding: 0;
          }
          .container {
            background-color: #D8D8D8;
            font-family: "Arial", sans-serif;
            margin: 0;
            padding: 0 0 32px 0;
          }
          .nav {
            background-color: ${config.emailBrandColor};
            height: 58px;
            text-align: center;
            width: 100%;
          }
          .nav img {
            height: 38px;
            margin-top: 10px
          }
          .content {
            background-color: #FFF;
            margin: 40px auto;
            max-width: 380px;
            padding: 40px 40px 48px 40px;
          }
          .content h1 {
            color: ${config.emailBrandColor};
            font-size: 30px;
            margin: 0 0 32px 0;
            text-align: center;
          }
          .content p {
            color: #000;
            font-size: 14px;
            margin: 0 0 32px 0;
            text-align: center;
          }
          .content .button {
            background-color: ${config.emailBrandColor};
            border-radius: 100px;
            color: #FFF;
            display: block;
            font-size: 14px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            text-decoration: none;
            width: 100%;
          }
          .content .closing {
            margin: 36px 0 0 0;
            text-align: center;
          }
          .footer .social-icons {
            margin: 36px 32px 28px 32px;
            text-align: center;
          }
          .footer .social-icon {
            display: inline-block;
            height: 32px;
            margin: 0 16px;
            width: 32px;
          }
          .footer .social-icon img {
            height: 32px;
            width: 32px;
          }
          .footer .address {
            color: #555;
            font-size: 14px;
            line-height: 20px;
            margin: 0;
            text-align: center;
          }
          .footer .unsubscribe {
            color: #555;
            display: block;
            font-size: 12px;
            margin: 32px 0 0 0;
            text-align: center;
            text-decoration: none;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <div class="nav">
            ${config.emailHeaderImageUrl ? `<img src="${config.emailHeaderImageUrl}" />` : ''}
          </div>
          <div class="content">
            ${headerText ? `<h1>${headerText}</h1>` : ''}
            ${paragraphText ? `<p>${paragraphText}</p>` : ''}
            ${buttonLink && buttonText ? `<a class="button" href="${buttonLink}">${buttonText}</a>` : ''}
          </div>
          <div class="footer">
            ${socialIcons}
            ${addressSection}
            ${unsubscribeLink ? `
              <a class="unsubscribe" href="${unsubscribeLink}">Unsubscribe</a>
            ` : ''}
          </div>
        </div>
      </body>

    </html>
  `
}

const addressSection = config.legalName || config.legalAddress ? `
  <div class="address">
    ${config.legalName}
    ${config.legalName && config.legalAddress ? '<br />' : ''}
    ${config.legalAddress}
  </div>
` : ''

const facebookIcon = config.socialFacebookImageUrl && config.socialFacebookPageUrl ? `
  <a class="social-icon" href="${config.socialFacebookPageUrl}">
    <img src="${config.socialFacebookImageUrl}" />
  </a>
` : ''

const githubIcon = config.socialGithubImageUrl && config.socialGithubPageUrl ? `
  <a class="social-icon" href="${config.socialGithubPageUrl}">
    <img src="${config.socialGithubImageUrl}" />
  </a>
` : ''

const redditIcon = config.socialRedditImageUrl && config.socialRedditPageUrl ? `
  <a class="social-icon" href="${config.socialRedditPageUrl}">
    <img src="${config.socialRedditImageUrl}" />
  </a>
` : ''

const twitterIcon = config.socialTwitterImageUrl && config.socialTwitterPageUrl ? `
  <a class="social-icon" href="${config.socialTwitterPageUrl}">
    <img src="${config.socialTwitterImageUrl}" />
  </a>
` : ''

const socialIcons = config.socialFacebookPageUrl
  || config.socialGithubPageUrl
  || config.socialRedditPageUrl
  || config.socialTwitterPageUrl ? `
  <div class="social-icons">
    ${facebookIcon}
    ${githubIcon}
    ${redditIcon}
    ${twitterIcon}
  </div>
` : ''
