const Joi = require('joi')
import { validateBaseBody } from './base'

const validateNotificationSubscribe = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      podcastId: Joi.string()
    })
    .required()
    .min(1)

  await validateBaseBody(schema, ctx, next)
}

const validateNotificationUnsubscribe = async (ctx, next) => {
  const schema = Joi.object()
    .keys({
      podcastId: Joi.string()
    })
    .required()
    .min(1)

  await validateBaseBody(schema, ctx, next)
}

export { validateNotificationSubscribe, validateNotificationUnsubscribe }
