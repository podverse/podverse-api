import { FeedObject } from "podcast-partytime";
import { itemCompat } from "@parser-rss/lib/compat/item";
import { liveItemCompat } from "@parser-rss/lib/compat/liveItem";

export const convertParsedRSSFeedToCompat = (parsedFeed: FeedObject) => {
  // const compatChannelData = feedCompat(parsedFeed);
  // const compatItemsData = parsedFeed.items.map(itemCompat);
  // const compatLiveItemsData = compatChannelData.liveItems.map(liveItemCompat);

  return {
    channel: {},
    items: [],
    liveItems: []
  }
}
