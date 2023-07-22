const Joi = require('joi')
import { validateBaseBody } from './base'

const validateUPDeviceCreate = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      upEndpoint: Joi.string(),
      upPublicKey: Joi.string(),
      upAuthKey: Joi.string()
    })
    .required()
    .min(1)

  await validateBaseBody(schema, ctx, next)
}

const validateUPDeviceDelete = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      upEndpoint: Joi.string()
    })
    .required()
    .min(1)

  await validateBaseBody(schema, ctx, next)
}

const validateUPDeviceUpdate = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      nextUPEndpoint: Joi.string(),
      previousUPEndpoint: Joi.string(),
      upPublicKey: Joi.string(),
      upAuthKey: Joi.string()
    })
    .required()
    .min(4)

  await validateBaseBody(schema, ctx, next)
}

export { validateUPDeviceCreate, validateUPDeviceDelete, validateUPDeviceUpdate }
