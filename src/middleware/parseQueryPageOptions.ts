import { config } from '~/config'

export const parseQueryPageOptions = async (ctx, next, type = '') => {
  const query = ctx.request.query
  const {
    categories,
    episodeId,
    hasVideo,
    id,
    includeAuthors,
    includeCategories,
    includeEpisode,
    includePodcast,
    maxResults,
    mediaRefId,
    name,
    page,
    playlistId,
    podcastId,
    searchAuthor,
    searchTitle,
    sincePubDate,
    slug,
    sort,
    title,
    topLevelCategories,
    userIds
  } = query

  const options = {
    sort: 'top-past-week',
    skip: 0,
    take: 50,
    ...(categories ? { categories } : {}),
    ...(episodeId ? { episodeId } : {}),
    ...(hasVideo ? { hasVideo } : {}),
    ...(includeAuthors ? { includeAuthors: includeAuthors === 'true' } : {}),
    ...(includeCategories ? { includeCategories: includeCategories === 'true' } : {}),
    ...(includeEpisode ? { includeEpisode: includeEpisode === 'true' } : {}),
    ...(includePodcast ? { includePodcast: includePodcast === 'true' } : {}),
    ...(maxResults ? { maxResults: true } : {}),
    ...(mediaRefId ? { mediaRefId } : {}),
    ...(playlistId ? { playlistId } : {}),
    ...(podcastId ? { podcastId } : {}),
    ...(searchTitle ? { searchTitle } : {}),
    ...(searchAuthor ? { searchAuthor } : {}),
    ...(searchTitle ? { searchTitle } : {}),
    ...(sincePubDate ? { sincePubDate } : {}),
    ...(topLevelCategories ? { topLevelCategories: topLevelCategories === 'true' } : {}),
    ...(userIds ? { userIds } : {})
  } as any

  // NOTE: for some reason when I use more than ~8 spread operators, the src/server.ts
  // takes forever to start :( I'd like to understand why this is happening...
  if (id) {
    options.id = id
  }

  if (name) {
    options.name = name
  }

  if (slug) {
    options.slug = slug
  }

  if (title) {
    options.title = title
  }

  if (sort) {
    options.sort = sort
  }

  if (type === 'authors') {
    options.take = config.queryAuthorsLimit
  } else if (type === 'categories') {
    options.take = config.queryCategoriesLimit
  } else if (type === 'episodes') {
    options.take = config.queryEpisodesLimit
  } else if (type === 'mediaRefs') {
    options.take = config.queryMediaRefsLimit
  } else if (type === 'playlists') {
    options.take = config.queryPlaylistsLimit
  } else if (type === 'podcasts') {
    options.take = config.queryPodcastsLimit
  } else if (type === 'users') {
    options.take = config.queryUsersLimit
  } else if (type === 'userHistoryItems') {
    options.take = config.queryUserHistoryItemsLimit
  }

  if (page > 1) {
    options.skip = (parseInt(page, 10) - 1) * options.take
  }

  ctx.state.query = options

  await next(ctx)
}
