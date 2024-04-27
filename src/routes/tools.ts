import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getFinalRedirectedUrl, request } from '~/lib/request'
const createError = require('http-errors')

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/tools` })

// POST
router.post('/findHTTPS', async (ctx) => {
  try {
    const body: any = ctx.request.body
    const url = body.url

    if (!body.url) {
      throw new Error('You must be pass a url param in the request body.')
    }

    const secureUrl = await extractHTTPSFromURL(url, 1)
    ctx.body = { secureUrl }
  } catch (error) {
    emitRouterError(error, ctx)
  }
})

const extractHTTPSFromURL = async (url, tries) => {
  try {
    if (tries > 5) {
      return url
    } else {
      const redirectedUrl = await getFinalRedirectedUrl(url)
      let finalUrl = redirectedUrl

      if (redirectedUrl.startsWith('http://')) {
        try {
          const attemptHttpsUrl = redirectedUrl.replace('http://', 'https://')
          // If no error is thrown,then assume it is a valid url.
          await request(attemptHttpsUrl, { followRedirect: true, method: 'head' })
          finalUrl = attemptHttpsUrl
        } catch (error) {
          throw new createError.NotFound('Secure URL for ' + url + ' was not found.')
        }
      }

      return finalUrl
    }
  } catch (error) {
    if (['301', '302', '303', '307', '308'].includes(String(error.statusCode))) {
      return extractHTTPSFromURL(error.response.location, tries + 1)
    } else {
      throw error
    }
  }
}

export const toolsRouter = router
