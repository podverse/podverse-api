const Joi = require('joi')
import { validateBase } from './base'

const validateAuthorQuery = async (ctx, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validateCategoryQuery = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validateEpisodeQuery = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validateFeedUrlQuery = async (ctx, next) => {
  const schema = Joi.object().keys({
    url: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validateMediaRefQuery = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validatePlaylistQuery = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validatePodcastQuery = async (ctx, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

const validateUserQuery = async (ctx, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required()
  })

  await validateBase(schema, ctx, next)
}

export {
  validateAuthorQuery,
  validateCategoryQuery,
  validateEpisodeQuery,
  validateFeedUrlQuery,
  validateMediaRefQuery,
  validatePlaylistQuery,
  validatePodcastQuery,
  validateUserQuery
}
