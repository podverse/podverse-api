const Joi = require('joi')
import { emitRouterError, JoiCustomValidationError } from 'errors'

export const validateBase = async (schema, ctx, next) => {
  const result = Joi.validate(ctx.query, schema)
  const error = result.error

  if (error) {
    for (const detail of error.details) {
      emitRouterError(new JoiCustomValidationError(error).BadRequest(), ctx)
    }
    return
  }

  await next()
}
