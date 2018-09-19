const Joi = require('joi')
import { emitRouterError, JoiCustomValidationError } from 'errors'

const validateBase = async (body, schema, ctx, next) => {
  const result = Joi.validate(body, schema)
  const error = result.error

  if (error) {
    for (const detail of error.details) {
      emitRouterError(new JoiCustomValidationError(error).BadRequest(), ctx)
    }
    return
  }

  await next()
}

export const validateBaseBody = async (schema, ctx, next) => {
  const body = ctx.request.body
  await validateBase(body, schema, ctx, next)
}

export const validateBaseQuery = async (schema, ctx, next) => {
  const query = ctx.query
  await validateBase(query, schema, ctx, next)
}
