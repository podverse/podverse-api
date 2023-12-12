import { liveItemStatuses } from 'podverse-shared'
import { validateBaseQuery } from './base'
const Joi = require('joi')

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
    hasVideo: Joi.boolean(),
    includePodcast: Joi.boolean(),
    isMusic: Joi.boolean(),
    maxResults: Joi.boolean(),
    podcastId: Joi.string(),
    podcastsOnly: Joi.boolean(),
    searchTitle: Joi.string().min(2),
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

const validateLiveItemSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    liveItemStatus: Joi.string().valid(...liveItemStatuses),
    hasVideo: Joi.boolean(),
    includePodcast: Joi.boolean(),
    isMusic: Joi.boolean(),
    maxResults: Joi.boolean(),
    podcastId: Joi.string(),
    searchTitle: Joi.string().min(2),
    sincePubDate: Joi.date().iso(),
    categories: Joi.string(),
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
    hasVideo: Joi.boolean(),
    includeEpisode: Joi.boolean(),
    includePodcast: Joi.boolean(),
    isMusic: Joi.boolean(),
    podcastId: Joi.string(),
    podcastsOnly: Joi.boolean(),
    searchTitle: Joi.string().min(2),
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
    hasVideo: Joi.boolean(),
    includeAuthors: Joi.boolean(),
    includeCategories: Joi.boolean(),
    isMusic: Joi.boolean(),
    maxResults: Joi.boolean(),
    podcastId: Joi.string(),
    podcastsOnly: Joi.boolean(),
    searchAuthor: Joi.string().min(2),
    searchTitle: Joi.string().min(2),
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
  validateLiveItemSearch,
  validateMediaRefSearch,
  validatePlaylistSearch,
  validatePodcastSearch,
  validateUserSearch
}
