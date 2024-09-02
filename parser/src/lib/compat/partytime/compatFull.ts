import { FeedObject } from "podcast-partytime";

export const convertParsedRSSFeedToCompat = (parsedFeed: FeedObject) => {
  return {
    channel: {},
    items: [],
    liveItems: []
  }
}
