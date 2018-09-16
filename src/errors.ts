const createError = require('http-errors')

export const emitRouterError = (error, ctx) => {
  ctx.status = error.status || ctx.status || 500
  ctx.body = error.message
  ctx.app.emit('error', error, ctx)
}

export class CustomValidationError extends Error {
  constructor (validationError) {
    super(validationError)
    for (const key of Object.keys(validationError.constraints)) {
      this.name = key
      this.message = validationError.constraints[key]
      Error.captureStackTrace(this, CustomValidationError)
    }
  }

  public BadRequest () {
    return new createError.BadRequest(this.message)
  }

}
