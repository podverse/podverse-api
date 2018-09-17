const createError = require('http-errors')

export const emitRouterError = (error, ctx) => {
  ctx.status = error.status || ctx.status || 500
  ctx.body = error.message
  ctx.app.emit('error', error, ctx)
}

export class CustomStatusError extends Error {
  public BadRequest () {
    return new createError.BadRequest(this.message)
  }
}

export class CustomValidationError extends CustomStatusError {
  constructor (error) {
    super(error)
    for (const key of Object.keys(error.constraints)) {
      this.name = key
      this.message = error.constraints[key]
      Error.captureStackTrace(this, CustomValidationError)
      return
    }
  }
}

export class JoiCustomValidationError extends CustomStatusError {
  constructor (error) {
    super(error)
    for (const detail of error.details) {
      this.name = error.name
      this.message = detail.message
      Error.captureStackTrace(this, JoiCustomValidationError)
      return
    }
  }
}
