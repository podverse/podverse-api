const Joi = require('joi')
import { validateBaseBody } from './base'

const validateMediaRefCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validatePlaylistCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateUserCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

export default {
  validateMediaRefCreate,
  validatePlaylistCreate,
  validateUserCreate
}
