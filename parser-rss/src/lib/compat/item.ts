import type { Episode as ItemObject } from 'podcast-partytime'
import { valueCompat } from "@parser-rss/lib/compat/value"

export const itemCompat = (item: ItemObject) => {
  return {
    alternateEnclosures: item.alternativeEnclosures ?? [],
    author: [item.author],
    chapters: item.podcastChapters,
    contentLinks: [],
    description: item.content || item.description,
    duration: item.duration,
    enclosure: item.enclosure,
    explicit: item.explicit,
    // funding: Array.isArray(item.podcastFunding) ? item.podcastFunding?.map((f) => fundingCompat(f)) : [],
    guid: item.guid,
    imageURL: item.image,
    itunesEpisode: item.podcastEpisode?.number || item.itunesEpisode,
    itunesEpisodeType: item.itunesEpisodeType,
    itunesSeason: item.podcastSeason?.number || item.itunesSeason,
    link: item.link,
    pubdate: item.pubDate,
    socialInteraction: item.podcastSocialInteraction ?? [],
    soundbite: item.podcastSoundbites ?? [],
    subtitle: item.subtitle,
    summary: getLongerSummary(item.content, item.description),
    title: item.title,
    transcript: item.podcastTranscripts ?? [],
    value: item.value ? [valueCompat(item.value)] : []
  }
}

const getLongerSummary = (content?: string, description?: string) => {
  const contentLength = content ? content.length : 0
  const descriptionLength = description ? description.length : 0
  const longerSummary = contentLength >= descriptionLength ? content : description
  return longerSummary
}
