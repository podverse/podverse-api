const Joi = require('joi')
import { validateBaseBody } from './base'

const validateBitPayInvoiceCreate = async (ctx, next) => {
  const schema = Joi.object().keys({})

  await validateBaseBody(schema, ctx, next)
}

const validateMediaRefCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    authors: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.string()),
    description: Joi.string(),
    endTime: Joi.number().integer().min(1).allow(null).allow(''),
    episodeId: Joi.string(),
    isPublic: Joi.boolean(),
    startTime: Joi.number().integer().min(0).required(),
    title: Joi.string().allow(null).allow('')
  })

  await validateBaseBody(schema, ctx, next)
}

const validatePayPalOrderCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    paymentID: Joi.string(),
    payerID: Joi.string(),
    paymentToken: Joi.string(),
    state: Joi.string()
  })

  await validateBaseBody(schema, ctx, next)
}

const validatePlaylistCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    description: Joi.string(),
    isPublic: Joi.boolean(),
    itemsOrder: Joi.array().items(Joi.string()),
    mediaRefs: Joi.array().items(Joi.string()),
    title: Joi.string()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateUserCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    historyItems: Joi.array().items(Joi.string()),
    name: Joi.string(),
    playlists: Joi.array().items(Joi.string()),
    subscribedPlaylistIds: Joi.array().items(Joi.string()),
    subscribedPodcastIds: Joi.array().items(Joi.string()),
    subscribedUserIds: Joi.array().items(Joi.string())
  })

  await validateBaseBody(schema, ctx, next)
}

export {
  validateBitPayInvoiceCreate,
  validateMediaRefCreate,
  validatePayPalOrderCreate,
  validatePlaylistCreate,
  validateUserCreate
}
