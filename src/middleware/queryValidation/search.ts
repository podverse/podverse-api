const Joi = require('joi')
import { validateBaseQuery } from './base'

const validateAuthorSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    id: Joi.string().min(7).max(14),
    name: Joi.string(),
    slug: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string()
  }).min(1)

  await validateBaseQuery(schema, ctx, next)
}

const validateCategorySearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    category: Joi.string(),
    categories: Joi.string(),
    id: Joi.string().min(7).max(14),
    slug: Joi.string(),
    title: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string()
  }).min(1)

  await validateBaseQuery(schema, ctx, next)
}

const validateEpisodeSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    authors: Joi.string(),
    category: Joi.string(),
    categories: Joi.string(),
    description: Joi.string(),
    duration: Joi.number().integer().min(0),
    episodeType: Joi.string(),
    guid: Joi.string(),
    id: Joi.string().min(7).max(14),
    imageUrl: Joi.string().uri(),
    includePodcast: Joi.boolean(),
    isExplicit: Joi.boolean(),
    linkUrl: Joi.string().uri(),
    mediaUrl: Joi.string().uri(),
    mediaRefs: Joi.string(),
    podcastId: Joi.string(),
    pubDate: Joi.date().iso(),
    searchAllFieldsText: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    title: Joi.string()
  })

  await validateBaseQuery(schema, ctx, next)
}

const validateFeedUrlSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    id: Joi.string(),
    isAuthority: Joi.boolean(),
    podcastId: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    url: Joi.string()
  }).min(1)

  await validateBaseQuery(schema, ctx, next)
}

const validateMediaRefSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    authors: Joi.string(),
    categories: Joi.string(),
    description: Joi.string(),
    endTime: Joi.number().integer().min(1),
    episodeDuration: Joi.number().integer().min(0),
    episodeGuid: Joi.string(),
    episodeId: Joi.string(),
    episodeImageUrl: Joi.string().uri(),
    episodeLinkUrl: Joi.string().uri(),
    episodeMediaUrl: Joi.string().uri(),
    episodePubDate: Joi.date().iso(),
    episodeSummary: Joi.string(),
    episodeTitle: Joi.string(),
    id: Joi.string().min(7).max(14),
    podcastFeedUrl: Joi.string().uri(),
    podcastGuid: Joi.string(),
    podcastId: Joi.string(),
    podcastImageUrl: Joi.string().uri(),
    podcastIsExplicit: Joi.boolean(),
    podcastTitle: Joi.string(),
    searchAllFieldsText: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    startTime: Joi.number().integer().min(0),
    title: Joi.string()
  })

  await validateBaseQuery(schema, ctx, next)
}

const validatePlaylistSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    playlistId: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string()
  }).min(1)

  await validateBaseQuery(schema, ctx, next)
}

const validatePodcastSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    categories: Joi.string(),
    podcastId: Joi.string(),
    searchAuthor: Joi.string(),
    searchTitle: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string()
  }).min(1)

  await validateBaseQuery(schema, ctx, next)
}

const validateUserSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    userIds: Joi.string()
  }).min(1)

  await validateBaseQuery(schema, ctx, next)
}

export {
  validateAuthorSearch,
  validateCategorySearch,
  validateEpisodeSearch,
  validateFeedUrlSearch,
  validateMediaRefSearch,
  validatePlaylistSearch,
  validatePodcastSearch,
  validateUserSearch
}
