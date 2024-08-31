import { parseFeed } from 'podcast-partytime';
import { request } from '@helpers/lib/request';
import { checkIfFeedFlagStatusShouldParse } from '@orm/entities/feed/feedFlagStatus';
import { ChannelService } from '@orm/services/channel/channel';
import { FeedService } from '@orm/services/feed/feed';
import { convertParsedRSSFeedToCompat } from '@parser-rss/lib/compat/compatFull';
import { handleParsedChannel } from '@parser-rss/lib/parser/channel/channel';
import { handleParsedItems } from './item/item';
import { ChannelSeasonService } from '@orm/services/channel/channelSeason';
import { compatChannelSeasonDtos } from '../compat/channel';

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
  const parsedFeed = await getAndParseRSSFeed(url);

  // TODO: add hashing save and check for full feed md5

  const feedService = new FeedService();
  const feed = await feedService.getOrCreate({ url, podcast_index_id });

  // TODO: check if already isParsing
  // TODO: set isParsing to true

  if (!checkIfFeedFlagStatusShouldParse(feed.feed_flag_status.id)) {
    throw new Error(`parseRSSFeedAndSaveToDatabase: feed_flag_status.status is not None or AlwaysAllow for ${url}`);
  }
  
  const channelService = new ChannelService();
  const channel = await channelService.getOrCreateByPodcastIndexId({ feed, podcast_index_id });
  
  // TODO: add hashing save and check for full channel data

  // TODO: move into helper function
  const channelSeasonService = new ChannelSeasonService();
  const channelSeasonDtos = compatChannelSeasonDtos(parsedFeed);

  if (channelSeasonDtos.length > 0) {
    await channelSeasonService.updateMany(channel, channelSeasonDtos);
  } else {
    await channelSeasonService._deleteAll(channel);
  }

  const channelSeasonIndex = await channelSeasonService.getChannelSeasonIndex(channel);
  
  await handleParsedChannel(parsedFeed, channel, channelSeasonIndex);

  // TODO: add hashing save and check for full item data

  await handleParsedItems(parsedFeed.items, channel, channelSeasonIndex);

  // TODO: add item_chapters_feed parsing handling to create item_chapter records

  // TODO: set isParsing to false in a finally block

  return feed;
}
