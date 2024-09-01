import { getMd5Hash } from "@helpers/lib/hash/hash";
import { FeedObject } from "podcast-partytime";

export const getParsedFeedMd5Hash = (parsedFeed: FeedObject): string => {
  const { lastUpdate, lastBuildDate, pubDate, ...parsedFeedPruned } = parsedFeed;
  const currentFeedFileHash = getMd5Hash(parsedFeedPruned);
  return currentFeedFileHash;
}
