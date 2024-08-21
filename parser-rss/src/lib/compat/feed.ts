import { FeedObject, Phase4Medium } from "podcast-partytime"
import { fundingCompat } from "@parser-rss/lib/compat/funding"
import { valueCompat } from "@parser-rss/lib/compat/value"

export const feedCompat = (feed: FeedObject) => {
  return {
    author: Array.isArray(feed.author) ? feed.author : feed.author ? [feed.author] : [],
    blocked: feed.itunesBlock,
    categories: feed.itunesCategory,
    description: feed.description,
    explicit: feed.explicit,
    funding: Array.isArray(feed.podcastFunding) ? feed.podcastFunding?.map((f) => fundingCompat(f)) : [],
    generator: feed.generator,
    guid: feed.guid,
    imageURL: feed.itunesImage || feed.image?.url,
    itunesType: feed.itunesType || 'episodic',
    language: feed.language,
    lastBuildDate: feed.lastBuildDate,
    link: feed.link,
    liveItems: feed.podcastLiveItems ?? [],
    medium: feed.medium ?? Phase4Medium.Podcast,
    owner: feed.owner,
    pubDate: feed.pubDate,
    subtitle: feed.subtitle,
    summary: feed.summary,
    title: feed.title,
    type: feed.itunesType,
    value: feed.value ? [valueCompat(feed.value)] : []
  }
}
