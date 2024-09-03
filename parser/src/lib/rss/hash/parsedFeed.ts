import { getMd5Hash } from "@helpers/lib/hash/hash";
import { FeedObject } from "podcast-partytime";

export const getParsedFeedMd5Hash = (parsedFeed: FeedObject): string => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lastUpdate, lastBuildDate, pubDate, ...parsedFeedPruned } = parsedFeed;
  const currentFeedFileHash = getMd5Hash(parsedFeedPruned);
  return currentFeedFileHash;
};
