import { Feed } from "@orm/entities/feed/feed";
import { FeedService } from "@orm/services/feed/feed";
import { FeedObject } from "podcast-partytime";
import { getParsedFeedMd5Hash } from "../hash/parsedFeed";
import { checkIfFeedFlagStatusShouldParse } from "@orm/entities/feed/feedFlagStatus";
import { FeedLogService } from "@orm/services/feed/feedLog";
import { getAndParseRSSFeed } from "../parser";
import { throwRequestError } from "@helpers/lib/request";

export const handleGetRSSFeed = async (feed: Feed): Promise<FeedObject> => {
  const feedLogService = new FeedLogService();
  let parsedFeed: FeedObject | null = null
  
  try {
    parsedFeed = await getAndParseRSSFeed(feed.url);
    await feedLogService.update(feed, {
      last_http_status: 200,
      last_good_http_status_time: new Date()
    });
  } catch (error) {
    const statusCode = (error as any).statusCode as number;
    const feedLog = await feedLogService._get(feed);
    if (statusCode) {
      await feedLogService.update(feed, {
        last_http_status: statusCode,
        parse_errors: (feedLog?.parse_errors || 0) + 1,
      });
    }
    return throwRequestError(error);
  }
  
  if (!parsedFeed) {
    const feedLog = await feedLogService._get(feed);
    await feedLogService.update(feed, {
      last_http_status: 200,
      last_finished_parse_time: new Date(),
      parse_errors: (feedLog?.parse_errors || 0) + 1,
    });
    return throwRequestError('parsedFeed no data found');
  }

  return parsedFeed;
}

export const handleParsedFeed = async (parsedFeed: FeedObject, url: string, podcast_index_id: number): Promise<Feed> => {
  const feedService = new FeedService();
  const feed = await feedService.getOrCreate({ url, podcast_index_id });
  
  // TODO: move before partytime parsing
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
  // TODO: handle with caching db / redis instead of database?
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
