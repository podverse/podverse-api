const Joi = require('joi')
import { validateBaseBody } from './base'

const validateFCMSubscribe = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      fcm: Joi.string(),
      podcastId: Joi.string()
    })
    .required()
    .min(2)

  await validateBaseBody(schema, ctx, next)
}

const validateFCMUnsubscribe = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      fcm: Joi.string(),
      podcastId: Joi.string()
    })
    .required()
    .min(2)

  await validateBaseBody(schema, ctx, next)
}

const validateFCMUnsubscribeAll = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      fcm: Joi.string()
    })
    .required()
    .min(1)

  await validateBaseBody(schema, ctx, next)
}

export { validateFCMSubscribe, validateFCMUnsubscribe, validateFCMUnsubscribeAll }
