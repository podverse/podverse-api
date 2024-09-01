import { parseFeed } from 'podcast-partytime';
import { request } from '@helpers/lib/request';
import { ChannelService } from '@orm/services/channel/channel';
import { FeedService } from '@orm/services/feed/feed';
import { convertParsedRSSFeedToCompat } from '@parser-rss/lib/compat/partytime/compatFull';
import { handleParsedChannel } from '@parser-rss/lib/parser/rss/channel/channel';
import { handleParsedItems } from './item/item';
import { ChannelSeasonService } from '@orm/services/channel/channelSeason';
import { handleParsedChannelSeasons } from './channel/channelSeason';
import { handleParsedLiveItems } from './liveItem/liveItem';
import { handleParsedFeed } from './feed/feed';

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
 
  // TODO: add feed log updates
  
  const feed = await handleParsedFeed(parsedFeed, url, podcast_index_id);
  
  const feedService = new FeedService();
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
  
    // TODO: if publisher feed, handle publisher remote item data
    // else handle parsed items
  
    await handleParsedItems(parsedFeed.items, channel, channelSeasonIndex);
  
    if (parsedFeed.podcastLiveItems) {
      await handleParsedLiveItems(parsedFeed.podcastLiveItems, channel, channelSeasonIndex);
    }
  
    // TODO: handle new item notifications
    
    // TODO: handle new live_item notifications
    
    // TODO: add item_chapters_feed parsing handling to create item_chapter records
  } finally {
    await feedService.update(feed.id, { is_parsing: null });
  }

  return feed;
}
