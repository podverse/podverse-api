const Joi = require('joi')
import { validateBaseQuery } from './base'

const validateUrlResolverPodcast = async (ctx, next) => {
  const schema = Joi.object().keys({
    podcastGuid: Joi.string(),
    podcastIndexId: Joi.string()
  })

  await validateBaseQuery(schema, ctx, next)
}

const validateUrlResolverEpisode = async (ctx, next) => {
  const schema = Joi.object().keys({
    podcastGuid: Joi.string(),
    podcastIndexId: Joi.string(),
    episodeGuid: Joi.string()
  })

  await validateBaseQuery(schema, ctx, next)
}

export { validateUrlResolverPodcast, validateUrlResolverEpisode }
