const Joi = require('joi')
import { podcastMediumAllowedValues } from '~/lib/constants'
import { validateBaseBody } from './base'

const validateAppStorePurchaseCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    transactionReceipt: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateBitPayInvoiceCreate = async (ctx, next) => {
  const schema = Joi.object().keys({})

  await validateBaseBody(schema, ctx, next)
}

const validateFeedUrlCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    isAuthority: Joi.boolean(),
    podcastId: Joi.string(),
    url: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateGooglePlayPurchaseCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    productId: Joi.string().required(),
    purchaseToken: Joi.string().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateMediaRefCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    authors: Joi.array(),
    categories: Joi.array(),
    endTime: Joi.number().integer().min(1).allow(null),
    episodeId: Joi.string(),
    isPublic: Joi.boolean(),
    startTime: Joi.number().integer().min(0),
    title: Joi.string().allow(null).allow('')
  })

  await validateBaseBody(schema, ctx, next)
}

const validatePayPalOrderCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    paymentID: Joi.string()
  })

  await validateBaseBody(schema, ctx, next)
}

const validatePlaylistCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    description: Joi.string().allow(null).allow(''),
    isPublic: Joi.boolean(),
    itemsOrder: Joi.array().items(Joi.string()),
    mediaRefs: Joi.array().items(Joi.string()),
    medium: Joi.string().allow(null).allow('').valid(podcastMediumAllowedValues),
    title: Joi.string().allow(null).allow('')
  })

  await validateBaseBody(schema, ctx, next)
}

export {
  validateAppStorePurchaseCreate,
  validateBitPayInvoiceCreate,
  validateGooglePlayPurchaseCreate,
  validateFeedUrlCreate,
  validateMediaRefCreate,
  validatePayPalOrderCreate,
  validatePlaylistCreate
}
