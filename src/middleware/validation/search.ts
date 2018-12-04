const Joi = require('joi')
import { validateBaseQuery } from './base'

const validateAuthorSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    id: Joi.string().min(7).max(14),
    name: Joi.string(),
    slug: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
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
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
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
    isExplicit: Joi.boolean(),
    isPublic: Joi.boolean(),
    linkUrl: Joi.string().uri(),
    mediaUrl: Joi.string().uri(),
    mediaRefs: Joi.string(),
    podcastId: Joi.string(),
    pubDate: Joi.date().iso(),
    title: Joi.string(),
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
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
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
    isNowPlayingItem: Joi.boolean(),
    isPublic: Joi.boolean(),
    podcastFeedUrl: Joi.string().uri(),
    podcastGuid: Joi.string(),
    podcastId: Joi.string(),
    podcastImageUrl: Joi.string().uri(),
    podcastIsExplicit: Joi.boolean(),
    podcastTitle: Joi.string(),
    startTime: Joi.number().integer().min(0),
    title: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  })

  await validateBaseQuery(schema, ctx, next)
}

const validatePlaylistSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    description: Joi.string(),
    id: Joi.string().min(7).max(14),
    isPublic: Joi.boolean(),
    mediaRefs: Joi.string(),
    title: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  }).min(1)

  await validateBaseQuery(schema, ctx, next)
}

const validatePodcastSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    authors: Joi.string(),
    categories: Joi.string(),
    description: Joi.string(),
    episodes: Joi.string(),
    feedLastUpdated: Joi.date().iso(),
    feedUrls: Joi.string(),
    guid: Joi.string(),
    id: Joi.string().min(7).max(14),
    imageUrl: Joi.string().uri(),
    isExplicit: Joi.boolean(),
    isPublic: Joi.boolean(),
    language: Joi.string(),
    linkUrl: Joi.string().uri(),
    title: Joi.string(),
    type: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
  }).min(1)

  await validateBaseQuery(schema, ctx, next)
}

const validateUserSearch = async (ctx, next) => {
  const schema = Joi.object().keys({
    id: Joi.string().min(7).max(14),
    name: Joi.string(),
    skip: Joi.number().integer().min(0),
    sort: Joi.string(),
    take: Joi.number().integer().min(0)
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
