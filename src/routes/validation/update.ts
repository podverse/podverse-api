const Joi = require('joi')
import { validateBaseBody } from 'routes/validation/base'

const validateMediaRefUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validatePlaylistUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateUserUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    id: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

export {
  validateMediaRefUpdate,
  validatePlaylistUpdate,
  validateUserUpdate
}
