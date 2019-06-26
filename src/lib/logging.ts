import * as Koa from 'koa'
import * as winston from 'winston'
import { config } from '~/config'

export const loggerInstance = winston.createLogger({
  level: config.debugLogging ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
})

export function logger () {

  return async (ctx: Koa.Context, next: () => Promise<any>) => {
    const start = new Date().getMilliseconds()

    const ms = new Date().getMilliseconds() - start

    let logLevel = ''
    if (ctx.status >= 500) {
      logLevel = 'error'
    } else if (ctx.status >= 400) {
      logLevel = 'warn'
    } else if (ctx.status >= 100) {
      logLevel = 'info'
    }

    const msg: string = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`

    loggerInstance.log(logLevel, msg)

    await next()
  }

}
