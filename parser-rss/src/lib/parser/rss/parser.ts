import { FeedObject, parseFeed } from 'podcast-partytime';
import { throwRequestError, request } from '@helpers/lib/request';
import { ChannelService } from '@orm/services/channel/channel';
import { FeedService } from '@orm/services/feed/feed';
import { convertParsedRSSFeedToCompat } from '@parser-rss/lib/compat/partytime/compatFull';
import { handleParsedChannel } from '@parser-rss/lib/parser/rss/channel/channel';
import { handleParsedItems } from './item/item';
import { ChannelSeasonService } from '@orm/services/channel/channelSeason';
import { handleParsedChannelSeasons } from './channel/channelSeason';
import { handleParsedLiveItems } from './liveItem/liveItem';
import { handleParsedFeed } from './feed/feed';
import { FeedLogService } from '@orm/services/feed/feedLog';

/*
  NOTE: All RSS feeds that have a podcast_index_id will be saved to the database.
  RSS feeds without podcast_index_id (Add By RSS feeds) will NOT be saved to the database.
*/

// TEMP: exists for development purposes
export const parseAllRSSFeeds = async () => {
  const feedService = new FeedService();
  const feeds = await feedService.getAll();
  for (const feed of feeds) {
    return await parseRSSFeedAndSaveToDatabase(feed.url, feed?.channel?.podcast_index_id);
  }
}

export const getAndParseRSSFeed = async (url: string) => {
  const xml = await request(url);
  const parsedFeed = parseFeed(xml, { allowMissingGuid: true });

  if (!parsedFeed) {
    throw new Error(`getAndParseRSSFeed: parsedFeed not found for ${url}`);
  }

  return parsedFeed;
}

export const parseRSSAddByRSSFeed = async (url: string) => {
  const parsedFeed = await getAndParseRSSFeed(url);
  const compatData = convertParsedRSSFeedToCompat(parsedFeed);
  return compatData
}

export const parseRSSFeedAndSaveToDatabase = async (url: string, podcast_index_id: number) => {
  const feedService = new FeedService();
  const feedLogService = new FeedLogService();
  let feed = await feedService.getBy({ url, podcast_index_id });

  if (!feed) {
    throw new Error(`parseRSSFeedAndSaveToDatabase: feed not found for ${url}`);
  }

  let parsedFeed: FeedObject | null = null
  try {
    parsedFeed = await getAndParseRSSFeed(url);
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

  // TODO: add feed log updates
  
  feed = await handleParsedFeed(parsedFeed, url, podcast_index_id);
  
  try {
    await feedService.update(feed.id, { is_parsing: new Date() });

    const channelService = new ChannelService();
    const channel = await channelService.getOrCreateByPodcastIndexId({ feed, podcast_index_id });
  
    // ChannelSeason must be parsed before anything else, because the channel season rows
    // need to be created for other data to have a foreign key to them.
    await handleParsedChannelSeasons(parsedFeed, channel);
    const channelSeasonService = new ChannelSeasonService();
    const channelSeasonIndex = await channelSeasonService.getChannelSeasonIndex(channel);
    
    await handleParsedChannel(parsedFeed, channel, channelSeasonIndex);
  
    // PTDO: if publisher feed, handle publisher remote item data
    // else handle parsed items
  
    await handleParsedItems(parsedFeed.items, channel, channelSeasonIndex);
  
    if (parsedFeed.podcastLiveItems) {
      await handleParsedLiveItems(parsedFeed.podcastLiveItems, channel, channelSeasonIndex);
    }
  
    // TODO: handle new item notifications
    
    // TODO: handle new live_item notifications
    
    await feedLogService.update(feed, { last_finished_parse_time: new Date() });
  } finally {
    await feedService.update(feed.id, { is_parsing: null });
  }

  return feed;
}
