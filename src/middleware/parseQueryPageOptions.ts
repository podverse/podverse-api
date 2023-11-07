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
    liveItemStatus,
    maxResults,
    mediaRefId,
    medium,
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
    skip: 0,
    take: 50,
    ...(categories ? { categories } : {}),
    ...(episodeId ? { episodeId } : {}),
    ...(hasVideo ? { hasVideo } : {}),
    ...(id ? { id } : {}),
    ...(includeAuthors ? { includeAuthors: includeAuthors === 'true' } : {}),
    ...(includeCategories ? { includeCategories: includeCategories === 'true' } : {}),
    ...(includeEpisode ? { includeEpisode: includeEpisode === 'true' } : {}),
    ...(includePodcast ? { includePodcast: includePodcast === 'true' } : {}),
    ...(liveItemStatus ? { liveItemStatus } : {}),
    ...(maxResults ? { maxResults: true } : {}),
    ...(mediaRefId ? { mediaRefId } : {}),
    ...(medium ? { medium } : {}),
    ...(name ? { name } : {}),
    ...(playlistId ? { playlistId } : {}),
    ...(podcastId ? { podcastId } : {}),
    ...(searchTitle ? { searchTitle } : {}),
    ...(searchAuthor ? { searchAuthor } : {}),
    ...(searchTitle ? { searchTitle } : {}),
    ...(sincePubDate ? { sincePubDate } : {}),
    ...(slug ? { slug } : {}),
    ...(sort ? { sort } : {}),
    ...(title ? { title } : {}),
    ...(topLevelCategories ? { topLevelCategories: topLevelCategories === 'true' } : {}),
    ...(userIds ? { userIds } : {})
  } as any

  if (sincePubDate) {
    // Use a larger than normal limit for sincePubDate requests
    options.take = 50
  } else if (type === 'authors') {
    options.take = config.queryAuthorsLimit
  } else if (type === 'categories') {
    options.take = config.queryCategoriesLimit
  } else if (type === 'episodes' || type === 'liveItems') {
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
