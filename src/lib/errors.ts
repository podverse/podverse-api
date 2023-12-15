import { CustomStatusError } from 'podverse-orm'

export const emitRouterError = (error, ctx) => {
  ctx.status = error.status || 500
  ctx.body = { message: error.message }
  ctx.app.emit('error', error, ctx)
}

export class JoiCustomValidationError extends CustomStatusError {
  constructor(error) {
    super(error)
    for (const detail of error.details) {
      this.name = error.name
      this.message = detail.message
      Error.captureStackTrace(this, JoiCustomValidationError)
      return
    }
  }
}
