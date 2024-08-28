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

export const compatChannelDescriptionDto = (parsedFeed: FeedObject) => {
  if (!parsedFeed.description) {
    return null
  }
  return {
    value: parsedFeed.description
  }
}

export const compatChannelFundingDtos = (parsedFeed: FeedObject) => {
  const dtos = []

  if (Array.isArray(parsedFeed.podcastFunding)) {
    for (const f of parsedFeed.podcastFunding) {
      if (f.url) {
        dtos.push({
          url: f.url,
          title: f.message || null
        })
      }
    }
  }

  return dtos
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

export const compatChannelLicenseDto = (parsedFeed: FeedObject) => {
  if (!parsedFeed?.license?.identifier) {
    return null
  }
  return {
    identifier: parsedFeed.license.identifier,
    url: parsedFeed.license.url || null
  }
}

export const compatChannelLocationDto = (parsedFeed: FeedObject) => {
  if (!parsedFeed?.podcastLocation?.geo && !parsedFeed?.podcastLocation?.osm) {
    return null
  }

  return {
    geo: parsedFeed.podcastLocation.geo || null,
    osm: parsedFeed.podcastLocation.osm || null,
    name: parsedFeed.podcastLocation.name || null
  }
}

export const compatChannelPersonDtos = (parsedFeed: FeedObject) => {
  const dtos = []

  if (Array.isArray(parsedFeed.podcastPeople)) {
    for (const p of parsedFeed.podcastPeople) {
      if (p.name) {
        dtos.push({
          name: p.name,
          role: p.role || null,
          person_group: p.group || 'cast',
          img: p.img || null,
          href: p.href || null
        })
      }
    }
  }

  return dtos
}

export const compatChannelPodrollRemoteItemDtos = (parsedFeed: FeedObject) => {
  const dtos = []

  if (Array.isArray(parsedFeed.podroll)) {
    for (const ri of parsedFeed.podroll) {
      if (ri.feedGuid) {
        dtos.push({
          feed_guid: ri.feedGuid,
          feed_url: ri.feedUrl || null,
          item_guid: null,
          medium: ri.medium ? getMediumValueValueEnumValue(ri.medium) : null,
          title: /* TODO: ri.title || */ null
        })
      }
    }
  }

  return dtos
}
