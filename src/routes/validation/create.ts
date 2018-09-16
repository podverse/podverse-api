const Joi = require('joi')
import { validateBase } from './base'

const validateMediaRefCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validatePlaylistCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validateUserCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

export default {
  validateMediaRefCreate,
  validatePlaylistCreate,
  validateUserCreate
}
