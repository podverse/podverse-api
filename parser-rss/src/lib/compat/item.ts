import { getItemItunesEpisodeTypeEnumValue } from '@orm/entities/item/itemItunesEpisodeType'
import type { Episode } from 'podcast-partytime'
import { Phase4PodcastImage } from 'podcast-partytime/dist/parser/phase/phase-4'
import { start } from 'repl'

export const itemCompat = (item: Episode) => {
  return {
    alternateEnclosures: item.alternativeEnclosures ?? [],
    author: [item.author],
    chapters: item.podcastChapters,
    contentLinks: [],
    description: item.content || item.description,
    duration: item.duration,
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

export const compatItemChaptersFeedDto = (parsedItem: Episode) => {
  if (!parsedItem.podcastChapters?.url && !parsedItem.podcastChapters?.type) return null
  
  return {
    url: parsedItem.podcastChapters?.url,
    type: parsedItem.podcastChapters?.type
  }
}

export const compatItemDescriptionDto = (parsedItem: Episode) => {
  if (!parsedItem.description) {
    return null
  }
  return {
    value: parsedItem.description
  }
}

export const compatItemEnclosureDtos = (parsedItem: Episode) => {
  const dtos = []

  if (parsedItem.alternativeEnclosures && parsedItem.alternativeEnclosures.length > 0) {
    for (const alternativeEnclosure of parsedItem.alternativeEnclosures) {
      const item_enclosure = {
        type: alternativeEnclosure.type,
        length: alternativeEnclosure.length || null,
        bitrate: alternativeEnclosure.bitrate || null,
        height: alternativeEnclosure.height || null,
        language: alternativeEnclosure.lang || null,
        title: alternativeEnclosure.title || null,
        rel: alternativeEnclosure.rel || null,
        codecs: alternativeEnclosure.codecs || null,
        item_enclosure_default: false
      }

      const item_enclosure_integrity = alternativeEnclosure.integrity || null

      const item_enclosure_sources = alternativeEnclosure.source.map(source => ({
        uri: source.uri,
        content_type: source.contentType
      }))

      const formattedDto = {
        item_enclosure,
        item_enclosure_integrity,
        item_enclosure_sources
      }

      dtos.push(formattedDto)
    }
  }
  
  return dtos
}

export const compatItemImageDtos = (parsedItem: Episode) => {
  const dtos = []
  if (parsedItem.itunesImage) {
    dtos.push({
      url: parsedItem.itunesImage,
      image_width_size: null
    })
  } else if (parsedItem.image) {
    dtos.push({
      url: parsedItem.image,
      image_width_size: null
    })
  }

  function hasWidth(image: Phase4PodcastImage['parsed']): image is { url: string; width: number } {
    return (image as { width: number }).width !== undefined;
  }

  if (Array.isArray(parsedItem.podcastImages)) {
    for (const image of parsedItem.podcastImages) {
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

export const compatItemLicenseDto = (parsedItem: Episode) => {
  if (!parsedItem?.license?.identifier) {
    return null
  }
  return {
    identifier: parsedItem.license.identifier,
    url: parsedItem.license.url || null
  }
}

export const compatItemLocationDto = (parsedItem: Episode) => {
  if (!parsedItem?.podcastLocation?.geo && !parsedItem?.podcastLocation?.osm) {
    return null
  }

  return {
    geo: parsedItem.podcastLocation.geo || null,
    osm: parsedItem.podcastLocation.osm || null,
    name: parsedItem.podcastLocation.name || null
  }
}

export const compatItemPersonDtos = (parsedItem: Episode) => {
  const dtos = []

  if (Array.isArray(parsedItem.podcastPeople)) {
    for (const p of parsedItem.podcastPeople) {
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

export const compatItemSeasonDto = (parsedItem: Episode) => {
  if (!parsedItem.podcastSeason?.number) {
    return null
  }

  return {
    number: parsedItem.podcastSeason.number,
    name: parsedItem.podcastSeason.name || null
  }
}

export const compatItemSeasonEpisodeDto = (parsedItem: Episode) => {
  if (!parsedItem.podcastEpisode) {
    return null
  }

  return {
    display: parsedItem.podcastEpisode.display || null,
    episode: parsedItem.podcastEpisode.number
  }
}

export const compatItemSocialInteractDtos = (parsedItem: Episode) => {
  const dtos = []

  if (parsedItem?.podcastSocialInteraction?.length) {
    for (const ps of parsedItem.podcastSocialInteraction) {
      dtos.push({
        // TODO: fix keys mismatch between partytime and podverse
        protocol: ps.platform,
        uri: ps.url,
        account_id: ps.id || null,
        account_url: ps.profileUrl || null,
        priority: ps.priority || null
      })
    }
  }

  return dtos
}

export const compatItemSoundbiteDtos = (parsedItem: Episode) => {
  const dtos = []

  if (parsedItem?.podcastSoundbites?.length) {
    for (const s of parsedItem.podcastSoundbites) {
      dtos.push({
        start_time: s.startTime,
        duration: s.duration,
        title: s.title || null
      })
    }
  }

  return dtos
}
