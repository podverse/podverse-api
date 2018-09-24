const Joi = require('joi')
import { emitRouterError, JoiCustomValidationError } from 'lib/errors'

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

export const validateQueryPageOptions = async (ctx, next) => {
  const schema = Joi.object().keys({
    order: Joi.object(),
    orderAsc: Joi.boolean(),
    skip: Joi.number().integer().min(0),
    take: Joi.number().integer().min(0)
  })

  const queryPageOptions = ctx.state.queryPageOptions
  await validateBase(queryPageOptions, schema, ctx, next)
}
