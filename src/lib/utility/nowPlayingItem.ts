export type NowPlayingItem = {
  clipEndTime?: number
  clipStartTime?: number
  clipTitle?: string
  episodeMediaUrl?: string
  episodePubDate?: string
  episodeTitle?: string
  imageUrl?: string
  podcastTitle?: string
}

export const convertToNowPlayingItem = (data) => {
  let nowPlayingItem: NowPlayingItem = {}

  if (!data) { return {} }

  // If it has a pubDate field, assume it is an Episode
  if (data.pubDate) {
    nowPlayingItem.episodeMediaUrl = data.mediaUrl
    nowPlayingItem.episodePubDate = data.pubDate
    nowPlayingItem.episodeTitle = data.title
    nowPlayingItem.imageUrl = data.podcast.imageUrl
    nowPlayingItem.podcastTitle = data.podcast.title
  } else { // Else assume it is a MediaRef
    const isRelational = !!data.episode
    nowPlayingItem.clipEndTime = data.endTime
    nowPlayingItem.clipStartTime = data.startTime
    nowPlayingItem.clipTitle = data.title
    nowPlayingItem.episodeMediaUrl = isRelational ? data.episode.mediaUrl : data.episodeMediaUrl
    nowPlayingItem.episodePubDate = isRelational ? data.episode.pubDate : data.episodePubDate
    nowPlayingItem.episodeTitle = isRelational ? data.episode.title : data.episodeTitle
    nowPlayingItem.imageUrl = isRelational ? data.episode.podcast.imageUrl : data.podcastImageUrl
    nowPlayingItem.podcastTitle = isRelational ? data.episode.podcast.title : data.podcastTitle
  }

  return nowPlayingItem
}
