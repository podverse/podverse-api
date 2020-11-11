const Joi = require('joi')
import { validateBaseQuery } from './base'

const validateAuthorSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    authorId: Joi.string().min(7).max(14),
    authorName: Joi.string(),
    authorSlug: Joi.string(),
    page: Joi.number().integer().min(0),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  })

  await validateBaseQuery(schema, ctx, next)
}

const validateCategorySearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    category: Joi.string(),
    categories: Joi.string(),
    id: Joi.string().min(7).max(14),
    slug: Joi.string(),
    title: Joi.string(),
    page: Joi.number().integer().min(0),
    skip: Joi.number().integer().min(0),
    topLevelCategories: Joi.boolean(),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  })

  await validateBaseQuery(schema, ctx, next)
}

const validateEpisodeSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    includePodcast: Joi.boolean(),
    podcastId: Joi.string(),
    searchAllFieldsText: Joi.string(),
    sincePubDate: Joi.date().iso(),
    categories: Joi.string(),
    page: Joi.number().integer().min(0),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  })

  await validateBaseQuery(schema, ctx, next)
}

const validateFeedUrlSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    id: Joi.string(),
    isAuthority: Joi.boolean(),
    podcastId: Joi.string(),
    url: Joi.string(),
    page: Joi.number().integer().min(0),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  })

  await validateBaseQuery(schema, ctx, next)
}

const validateMediaRefSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    allowUntitled: Joi.boolean(),
    categories: Joi.string(),
    episodeId: Joi.string(),
    includeEpisode: Joi.boolean(),
    includePodcast: Joi.boolean(),
    podcastId: Joi.string(),
    searchAllFieldsText: Joi.string(),
    page: Joi.number().integer().min(0),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  })

  await validateBaseQuery(schema, ctx, next)
}

const validatePlaylistSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    playlistId: Joi.string(),
    page: Joi.number().integer().min(0),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  })

  await validateBaseQuery(schema, ctx, next)
}

const validatePodcastSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    categories: Joi.string(),
    includeAuthors: Joi.boolean(),
    includeCategories: Joi.boolean(),
    maxResults: Joi.boolean(),
    podcastId: Joi.string(),
    searchAuthor: Joi.string(),
    searchTitle: Joi.string(),
    page: Joi.number().integer().min(0),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  })

  await validateBaseQuery(schema, ctx, next)
}

const validateUserSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    userIds: Joi.string().allow(''),
    page: Joi.number().integer().min(0),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  })

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
