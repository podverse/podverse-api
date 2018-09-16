const Joi = require('joi')

const validateQuery = async (schema, ctx, next) => {
  const result = Joi.validate(ctx.query, schema)

  if (result.error) {
    for (const detail of result.error.details) {
      ctx.throw(400, detail.message)
    }
  }

  await next()
}

export const validateAuthorQuery = async (ctx, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().required()
  })

  await validateQuery(schema, ctx, next)
}
