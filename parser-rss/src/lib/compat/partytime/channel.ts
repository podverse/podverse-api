import { FeedObject, Phase4Medium } from "podcast-partytime"
import { compatChannelValue } from "@parser-rss/lib/compat/partytime/value"
import { createSortableTitle } from "@orm/lib/sortableTitle"
import { getMediumEnumValue } from "@orm/entities/medium"
import { getChannelItunesTypeItunesTypeEnumValue } from "@orm/entities/channel/channelItunesType"
import { getBooleanOrNull } from "@helpers/lib/boolean"
import { Phase4PodcastImage } from "podcast-partytime/dist/parser/phase/phase-4"

export const compatChannelDto = (parsedFeed: FeedObject) => ({
  podcast_guid: parsedFeed.guid,
  title: parsedFeed.title,
  sortable_title: createSortableTitle(parsedFeed.title),
  medium: getMediumEnumValue(parsedFeed.medium ?? Phase4Medium.Podcast)
})

export const compatChannelAboutDto = (parsedFeed: FeedObject) => ({
  author: (Array.isArray(parsedFeed.author) ? parsedFeed.author : parsedFeed.author ? [parsedFeed.author] : [])?.join(', ') || null,
  explicit: getBooleanOrNull(parsedFeed.explicit),
  language: parsedFeed.language || null,
  website_link_url: parsedFeed.link || null,
  itunes_type: getChannelItunesTypeItunesTypeEnumValue(parsedFeed.itunesType || 'episodic')
})

export const compatChannelChatDto = (parsedFeed: FeedObject) => {
  if (!parsedFeed.chat) {
    return null
  }
  return {
    server: parsedFeed.chat.server,
    protocol: parsedFeed.chat.protocol,
    account_id: parsedFeed.chat.accountId || null,
    space: parsedFeed.chat.space || null
  }
}

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
          role: p.role?.toLowerCase() || null,
          person_group: p.group?.toLowerCase() || 'cast',
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
          title: /* TODO: ri.title || */ null
        })
      }
    }
  }

  return dtos
}

export const compatChannelPublisherRemoteItemDtos = (parsedFeed: FeedObject) => {
  const dtos = []

  if (Array.isArray(parsedFeed.podroll)) {
    for (const ri of parsedFeed.podroll) {
      if (ri.feedGuid) {
        dtos.push({
          feed_guid: ri.feedGuid,
          feed_url: ri.feedUrl || null,
          item_guid: null,
          title: /* TODO: ri.title || */ null
        })
      }
    }
  }

  return dtos
}

export const compatChannelRemoteItemDtos = (parsedFeed: FeedObject) => {
  const dtos = []

  if (Array.isArray(parsedFeed.podcastRemoteItems)) {
    for (const ri of parsedFeed.podcastRemoteItems) {
      if (ri.feedGuid) {
        dtos.push({
          feed_guid: ri.feedGuid,
          feed_url: ri.feedUrl || null,
          item_guid: null,
          title: /* TODO: ri.title || */ null
        })
      }
    }
  }

  return dtos
}

export const compatChannelSocialInteractDtos = (parsedFeed: FeedObject) => {
  const dtos = []

  if (parsedFeed?.podcastSocial?.length) {
    for (const ps of parsedFeed.podcastSocial) {
      dtos.push({
        // TODO: fix keys mismatch between partytime and podverse
        protocol: ps.platform,
        uri: ps.url,
        account_id: ps.id || null,
        account_url: ps.name || null,
        priority: ps.priority || null
      })
    }
  }

  return dtos
}

export const compatChannelSeasonDtos = (parsedFeed: FeedObject) => {
  const dtos = []

  const parsedItems = parsedFeed?.items || []

  const seasonsIndex: { [key: number]: { name: string | null } } = {};

  for (const parsedItem of parsedItems) {
    const seasonNumber = parsedItem?.podcastSeason?.number || parsedItem?.itunesSeason
    const seasonName = parsedItem?.podcastSeason?.name || null
    if (Number.isInteger(seasonNumber)) {
      const seasonNumberAsNumber = seasonNumber as number;
      seasonsIndex[seasonNumberAsNumber] = {
        name: seasonName
      }
    }
  }

  for (const [number, { name }] of Object.entries(seasonsIndex)) {
    dtos.push({
      number: parseInt(number),
      name: name || null
    })
  }

  return dtos
}

export const compatChannelTrailerDtos = (parsedFeed: FeedObject) => {
  const dtos = []
  if (parsedFeed?.trailers?.length) {
    for (const pt of parsedFeed.trailers) {
      dtos.push({
        url: pt.url,
        title: /* TODO: add pt.title || */ null,
        pubdate: pt.pubdate,
        length: pt.length || null,
        type: pt.type || null,
        season: pt.season || null
      })
    }
  }

  return dtos
}

export const compatChannelTxtDtos = (parsedFeed: FeedObject) => {
  const dtos = []
  if (parsedFeed?.podcastTxt?.length) {
    for (const pt of parsedFeed.podcastTxt) {
      dtos.push({
        purpose: pt.purpose || null,
        value: pt.value
      })
    }
  }

  return dtos
}

export const compatChannelValueDtos = (parsedFeed: FeedObject) => {
  let dtos = []
  if (parsedFeed.value) {
    const dto = compatChannelValue(parsedFeed.value)

    const formattedDto = {
      channel_value: {
        type: dto.type,
        method: dto.method,
        suggested: dto.suggested || null
      },
      channel_value_recipients: dto.channel_value_recipients
    }

    dtos.push(formattedDto)
  }
  return dtos
}
