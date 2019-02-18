import { config } from '~/config'

export const parseQueryPageOptions = async (ctx, next, type = '') => {

  const query = ctx.request.query
  const { categories, episodeId, playlistId, podcastId, searchAuthor,
    searchTitle, userIds } = query

  let options = {
    sort: 'top-past-week',
    skip: 0,
    take: 20,
    ...(categories ? { categories } : {}),
    ...(episodeId ? { episodeId } : {}),
    ...(playlistId ? { playlistId } : {}),
    ...(podcastId ? { podcastId } : {}),
    ...(searchAuthor ? { searchAuthor } : {}),
    ...(searchTitle ? { searchTitle } : {}),
    ...(userIds ? { userIds } : {})
  }

  const { page, sort } = query

  if (sort) {
    options.sort = sort
  }

  if (type === 'episodes') {
    options.take = config.queryEpisodesLimit
  } else if (type === 'mediaRefs') {
    options.take = config.queryMediaRefsLimit
  } else if (type === 'playlists') {
    options.take = config.queryPlaylistsLimit
  } else if (type === 'podcasts') {
    options.take = config.queryPodcastsLimit
  } else if (type === 'users') {
    options.take = config.queryUsersLimit
  }

  if (page > 1) {
    options.skip = (((parseInt(page, 10) - 1) * options.take))
  }

  ctx.request.query = options

  await next(ctx)
}
