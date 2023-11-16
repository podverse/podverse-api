import { podcastMediumAllowedValues } from '~/lib/constants'
const createError = require('http-errors')

export const requireAndParseMediumQueryParam = async (ctx, next) => {
  const query = ctx.request.query

  const medium = query?.medium

  if (!medium) {
    throw new createError.BadRequest(
      `A "medium" query param must be provided with one of the following values: ${podcastMediumAllowedValues}`
    )
  }

  if (!podcastMediumAllowedValues.includes(medium)) {
    throw new createError.BadRequest('Invalid medium passed as query param')
  }

  ctx.state.query = {
    ...ctx.state.query,
    medium
  }

  await next(ctx)
}
