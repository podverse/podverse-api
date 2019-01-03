const Joi = require('joi')
import { validateBaseBody } from './base'

const validateMediaRefUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    authors: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.string()),
    description: Joi.string(),
    endTime: Joi.number().integer().min(1).allow(null).allow(''),
    episodeId: Joi.string(),
    id: Joi.string(),
    isPublic: Joi.boolean(),
    startTime: Joi.number().integer().min(0).required(),
    title: Joi.string().allow(null).allow('')
  })

  await validateBaseBody(schema, ctx, next)
}

const validatePayPalOrderUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    paymentID: Joi.string(),
    payerID: Joi.string(),
    paymentToken: Joi.string(),
    state: Joi.string()
  })

  await validateBaseBody(schema, ctx, next)
}

const validatePlaylistUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    description: Joi.string().allow(null),
    id: Joi.string().min(7).max(14).required(),
    isPublic: Joi.boolean(),
    itemsOrder: Joi.array().items(Joi.string()),
    mediaRefs: Joi.array().items(Joi.string()),
    ownerId: Joi.string(),
    title: Joi.string().allow(null)
  })

  await validateBaseBody(schema, ctx, next)
}

const validateUserMembershipUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    id: Joi.string().min(7).max(14).required(),
    membershipExpiration: Joi.date().iso().required()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateUserUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string(),
    id: Joi.string().min(7).max(14).required(),
    name: Joi.string().allow(null).allow('')
  })

  await validateBaseBody(schema, ctx, next)
}

const validateUserUpdateQueue = async (ctx, next) => {
  const schema = Joi.object().keys({
    queueItems: Joi.array().items(Joi.object())
  })

  await validateBaseBody(schema, ctx, next)
}

const validateUserAddOrUpdateHistoryItem = async (ctx, next) => {
  const schema = Joi.object().keys({
    historyItem: Joi.object()
  })

  await validateBaseBody(schema, ctx, next)
}

export {
  validateMediaRefUpdate,
  validatePayPalOrderUpdate,
  validatePlaylistUpdate,
  validateUserAddOrUpdateHistoryItem,
  validateUserMembershipUpdate,
  validateUserUpdate,
  validateUserUpdateQueue
}
