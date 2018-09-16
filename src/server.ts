import * as cors from '@koa/cors'
import * as dotenv from 'dotenv'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as jwt from 'koa-jwt'
import * as winston from 'winston'

import { config } from 'config'
import { logger } from 'logging'
import { authorRouter, categoryRouter, episodeRouter, feedUrlRouter,
  mediaRefRouter, playlistRouter, podcastRouter, userRouter } from 'routes'
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

  app.use(categoryRouter.routes())
  app.use(categoryRouter.allowedMethods())

  app.use(episodeRouter.routes())
  app.use(episodeRouter.allowedMethods())

  app.use(feedUrlRouter.routes())
  app.use(feedUrlRouter.allowedMethods())

  app.use(mediaRefRouter.routes())
  app.use(mediaRefRouter.allowedMethods())

  app.use(playlistRouter.routes())
  app.use(playlistRouter.allowedMethods())

  app.use(podcastRouter.routes())
  app.use(podcastRouter.allowedMethods())

  app.use(userRouter.routes())
  app.use(userRouter.allowedMethods())

  app.listen(config.port)

  console.log(`Server running on port ${config.port}`)
}

bootstrap()
