export const parseQueryPageOptions = async (ctx, next) => {

  const query = ctx.request.query
  const { categories, episodeId, playlistId, podcastId, searchAuthor,
    searchTitle } = query

  let options = {
    sort: 'top-past-week',
    skip: 0,
    take: 2,
    ...(categories ? { categories } : {}),
    ...(episodeId ? { episodeId } : {}),
    ...(playlistId ? { playlistId } : {}),
    ...(podcastId ? { podcastId } : {}),
    ...(searchAuthor ? { searchAuthor } : {}),
    ...(searchTitle ? { searchTitle } : {})
  }

  const { page, sort } = query

  if (sort) {
    options.sort = sort
  }

  if (page > 1) {
    options.skip = (((parseInt(page, 10) - 1) * options.take))
  }

  ctx.request.query = options

  await next(ctx)
}
