import * as Koa from 'koa'
import { databaseInitializer } from 'initializers/database'

const bootstrap = async () => {
  await databaseInitializer()

  const app = new Koa()

  app.use(async ctx => {
    ctx.body = 'It works still!'
  })

  app.listen(2001)
}

bootstrap()
