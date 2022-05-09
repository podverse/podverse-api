const Joi = require('joi')
import { validateBaseBody } from './base'

const validateFCMDeviceCreate = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      fcmToken: Joi.string()
    })
    .required()
    .min(1)

  await validateBaseBody(schema, ctx, next)
}

const validateFCMDeviceDelete = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      fcmToken: Joi.string()
    })
    .required()
    .min(1)

  await validateBaseBody(schema, ctx, next)
}

const validateFCMDeviceUpdate = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      nextFCMToken: Joi.string(),
      previousFCMToken: Joi.string()
    })
    .required()
    .min(2)

  await validateBaseBody(schema, ctx, next)
}

export { validateFCMDeviceCreate, validateFCMDeviceDelete, validateFCMDeviceUpdate }
