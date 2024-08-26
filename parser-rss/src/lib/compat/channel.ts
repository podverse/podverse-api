import { FeedObject, Phase4Medium } from "podcast-partytime"
import { fundingCompat } from "@parser-rss/lib/compat/funding"
import { valueCompat } from "@parser-rss/lib/compat/value"
import { createSortableTitle } from "@orm/lib/sortableTitle"
import { getMediumValueValueEnumValue } from "@orm/entities/mediumValue"
import { getChannelItunesTypeItunesTypeEnumValue } from "@orm/entities/channel/channelItunesType"
import { getBooleanOrNull } from "@helpers/lib/boolean"
import { Phase4PodcastImage } from "podcast-partytime/dist/parser/phase/phase-4"

export const feedCompat = (feed: FeedObject) => {
  return {
    blocked: feed.itunesBlock,
    categories: feed.itunesCategory,
    funding: Array.isArray(feed.podcastFunding) ? feed.podcastFunding?.map((f) => fundingCompat(f)) : [],
    generator: feed.generator,
    imageURL: feed.itunesImage || feed.image?.url,
    lastBuildDate: feed.lastBuildDate,
    liveItems: feed.podcastLiveItems ?? [],
    medium: feed.medium ?? Phase4Medium.Podcast,
    owner: feed.owner,
    pubDate: feed.pubDate,
    subtitle: feed.subtitle,
    summary: feed.summary,
    type: feed.itunesType,
    value: feed.value ? [valueCompat(feed.value)] : []
  }
}

export const compatChannelDto = (parsedFeed: FeedObject) => ({
  podcast_guid: parsedFeed.guid,
  title: parsedFeed.title,
  sortable_title: createSortableTitle(parsedFeed.title),
  medium_value: getMediumValueValueEnumValue(parsedFeed.medium ?? Phase4Medium.Podcast)
})

export const compatChannelAboutDto = (parsedFeed: FeedObject) => ({
  author: (Array.isArray(parsedFeed.author) ? parsedFeed.author : parsedFeed.author ? [parsedFeed.author] : [])?.join(', ') || null,
  explicit: getBooleanOrNull(parsedFeed.explicit),
  language: parsedFeed.language || null,
  website_link_url: parsedFeed.link || null,
  itunes_type: getChannelItunesTypeItunesTypeEnumValue(parsedFeed.itunesType || 'episodic')
})

export const compatChannelDescriptionDto = (parsedFeed: FeedObject) => ({
  value: parsedFeed.description
})

export const compatChannelFundingDtos = (parsedFeed: FeedObject) => {
  return Array.isArray(parsedFeed.podcastFunding) ? parsedFeed.podcastFunding.map((f) => ({
    url: f.url,
    title: f.message
  })) : []
}

export const compatChannelImageDtos = (parsedFeed: FeedObject) => {
  const dtos = []
  if (parsedFeed.itunesImage) {
    dtos.push({
      url: parsedFeed.itunesImage,
      image_width_size: null
    })
  } else if (parsedFeed.image?.url) {
    dtos.push({
      url: parsedFeed.image.url,
      image_width_size: null
    })
  }

  function hasWidth(image: Phase4PodcastImage['parsed']): image is { url: string; width: number } {
    return (image as { width: number }).width !== undefined;
  }

  if (Array.isArray(parsedFeed.podcastImages)) {
    for (const image of parsedFeed.podcastImages) {
      if (image.parsed.url && hasWidth(image.parsed)) {
        dtos.push({
          url: image.parsed.url,
          image_width_size: image.parsed.width
        })
      }
    }
  }

  return dtos
}
