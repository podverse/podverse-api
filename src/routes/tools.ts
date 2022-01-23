import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { request } from '~/lib/request'
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
    const res = await request(url, { followRedirect: false, method: 'head' })
    if (tries > 5) {
      throw new createError.NotFound('Secure URL for ' + url + ' was not found. Too many redirects')
    } else if (!res.location) {
      if (url.startsWith('https://')) {
        return url
      } else {
        throw new createError.NotFound('Secure URL for ' + url + ' was not found.')
      }
    } else {
      return extractHTTPSFromURL(res.location, tries + 1)
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
