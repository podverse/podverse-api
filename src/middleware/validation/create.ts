const Joi = require('joi')
import { validateBaseBody } from './base'

const validateMediaRefCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    _episodeId: Joi.string(),
    _ownerId: Joi.string(),
    _podcastId: Joi.string(),
    authors: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.string()),
    description: Joi.string(),
    endTime: Joi.number().integer().min(1),
    episodeDuration: Joi.number().integer().min(0),
    episodeGuid: Joi.string(),
    episodeId: Joi.string(),
    episodeImageUrl: Joi.string().uri(),
    episodeLinkUrl: Joi.string().uri(),
    episodeMediaUrl: Joi.string().uri().required(),
    episodePubDate: Joi.date().iso(),
    episodeSummary: Joi.string(),
    episodeTitle: Joi.string(),
    isPublic: Joi.boolean(),
    ownerId: Joi.string(),
    podcastFeedUrl: Joi.string().uri(),
    podcastGuid: Joi.string(),
    podcastId: Joi.string(),
    podcastImageUrl: Joi.string().uri(),
    podcastIsExplicit: Joi.boolean(),
    podcastTitle: Joi.string(),
    startTime: Joi.number().integer().min(0).required(),
    title: Joi.string()
  })

  await validateBaseBody(schema, ctx, next)
}

const validatePlaylistCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    description: Joi.string(),
    isPublic: Joi.boolean(),
    itemsOrder: Joi.array().items(Joi.string()),
    mediaRefs: Joi.array().items(Joi.string()),
    ownerId: Joi.string().required(),
    title: Joi.string()
  })

  await validateBaseBody(schema, ctx, next)
}

const validateUserCreate = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    name: Joi.string(),
    playlists: Joi.array().items(Joi.string()),
    subscribedPodcastIds: Joi.array().items(Joi.string())
  })

  await validateBaseBody(schema, ctx, next)
}

export {
  validateMediaRefCreate,
  validatePlaylistCreate,
  validateUserCreate
}
