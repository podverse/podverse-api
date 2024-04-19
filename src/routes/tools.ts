import * as Router from 'koa-router'
import { config } from '~/config'
import { emitRouterError } from '~/lib/errors'
import { getFinalRedirectedUrl } from '~/lib/request'

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
      return redirectedUrl
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
