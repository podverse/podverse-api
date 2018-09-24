import * as bodyParser from 'koa-bodyparser'
import * as passport from 'koa-passport'
import * as Router from 'koa-router'
import { config } from 'config'
import { emitRouterError } from 'errors'
import { createUser } from 'controllers/user'
import { authenticate, localAuth } from 'middleware/auth'

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/auth` })

router.use(bodyParser())

router.post('/register', async (ctx) => {
  // try {
  //   const body = ctx.request.body
  //   const user = await createUser(body)

  //   return passport.authenticate('local', (error, user, info, status) => {
  //     if (error) {
  //       throw error
  //     }

  //     if (user) {
  //       ctx.body = 'if'
  //     } else {
  //       ctx.body = 'else'
  //     }
  //   })(ctx)
  // } catch (error) {
  //   emitRouterError(error, ctx)
  // }
})

router.post('/login', localAuth, authenticate)

export default router
