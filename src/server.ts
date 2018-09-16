import * as cors from '@koa/cors'
import * as dotenv from 'dotenv'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as jwt from 'koa-jwt'
import * as winston from 'winston'

import { config } from 'config'
import { logger } from 'logging'
import authorRouter from 'routes/author'
import { databaseInitializer } from 'initializers/database'

const bootstrap = async () => {
  dotenv.config({ path: './env' })

  await databaseInitializer()

  const app = new Koa()

  app.use(helmet())
  app.use(cors())
  app.use(logger(winston))
  app.use(bodyParser())

  // app.use(jwt({ secret: config.jwtSecret }))

  app.use(authorRouter.routes())
  app.use(authorRouter.allowedMethods())

  app.listen(config.port)

  console.log(`Server running on port ${config.port}`)
}

bootstrap()
