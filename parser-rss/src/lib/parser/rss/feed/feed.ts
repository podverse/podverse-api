import { Feed } from "@orm/entities/feed/feed";
import { FeedService } from "@orm/services/feed/feed";
import { FeedObject } from "podcast-partytime";
import { getParsedFeedMd5Hash } from "../hash/parsedFeed";
import { checkIfFeedFlagStatusShouldParse } from "@orm/entities/feed/feedFlagStatus";

export const handleParsedFeed = async (parsedFeed: FeedObject, url: string, podcast_index_id: number): Promise<Feed> => {
  const feedService = new FeedService();
  const feed = await feedService.getOrCreate({ url, podcast_index_id });
  
  if (!checkIfFeedFlagStatusShouldParse(feed.feed_flag_status.id)) {
    throw new Error(`parseRSSFeedAndSaveToDatabase: feed_flag_status.status is not None or AlwaysAllow for ${url}`);
  }

  checkIfFeedIsParsing(feed);
 
  const currentFeedFileHash = getParsedFeedMd5Hash(parsedFeed);

  if (feed.last_parsed_file_hash === currentFeedFileHash) {
    throw new Error(`Feed ${feed.id} has no changes since last parsed.`);
  }

  return feedService.update(feed.id, { last_parsed_file_hash: currentFeedFileHash });
}

const checkIfFeedIsParsing = (feed: Feed): void => {
  if (feed.is_parsing) {
    const parsingDate = new Date(feed.is_parsing);
    const currentDate = new Date();
    const timeDifference = (currentDate.getTime() - parsingDate.getTime()) / (1000 * 60);
  
    if (isNaN(parsingDate.getTime())) {
      throw new Error(`Feed ${feed.id} has an invalid parsing date`);
    }
  
    if (timeDifference <= 30) {
      throw new Error(`Feed ${feed.id} is already parsing`);
    }
  }
}
