const Joi = require('joi')
import { validateBaseBody } from './base'

const validateMediaRefUpdate = async (ctx, next) => {
  const schema = Joi.object().keys({
    authors: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.string()),
    description: Joi.string(),
    endTime: Joi.number().integer().min(1).allow(null).allow(''),
    episodeDuration: Joi.number().integer().min(0),
    episodeGuid: Joi.string(),
    episodeId: Joi.string(),
    episodeImageUrl: Joi.string().uri(),
    episodeLinkUrl: Joi.string().uri(),
    episodeMediaUrl: Joi.string().uri().required(),
    episodePubDate: Joi.date().iso(),
    episodeSummary: Joi.string(),
    episodeTitle: Joi.string(),
    id: Joi.string(),
    isPublic: Joi.boolean(),
    podcastFeedUrl: Joi.string().uri(),
    podcastGuid: Joi.string(),
    podcastId: Joi.string(),
    podcastImageUrl: Joi.string().uri(),
    podcastIsExplicit: Joi.boolean(),
    podcastTitle: Joi.string(),
    startTime: Joi.number().integer().min(0).required(),
    title: Joi.string().allow(null).allow('')
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
  validatePlaylistUpdate,
  validateUserAddOrUpdateHistoryItem,
  validateUserUpdate,
  validateUserUpdateQueue
}
