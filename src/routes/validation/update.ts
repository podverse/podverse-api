const Joi = require('joi')
import { validateBase } from './base'

const validateMediaRefUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validatePlaylistUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validateUserUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

export {
  validateMediaRefUpdate,
  validatePlaylistUpdate,
  validateUserUpdate
}
