import { getItemItunesEpisodeTypeEnumValue } from '@orm/entities/item/itemItunesEpisodeType'
import type { Episode } from 'podcast-partytime'

export const itemCompat = (item: Episode) => {
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
    transcript: item.podcastTranscripts ?? []
  }
}

const getLongerSummary = (content?: string, description?: string) => {
  const contentLength = content ? content.length : 0
  const descriptionLength = description ? description.length : 0
  const longerSummary = contentLength >= descriptionLength ? content : description
  return longerSummary
}

export const compatItemDto = (parsedItem: Episode) => ({
  guid: parsedItem.guid || null,
  guid_enclosure_url: parsedItem.enclosure.url,
  pubdate: parsedItem.pubDate || null,
  title: parsedItem.title || null
})

export const compatItemAboutDto = (parsedItem: Episode) => ({
  duration: parsedItem.duration || null,
  explicit: parsedItem.explicit || false,
  website_link_url: parsedItem.link || null,
  item_itunes_episode_type: getItemItunesEpisodeTypeEnumValue(parsedItem.itunesEpisodeType || 'full')
})
