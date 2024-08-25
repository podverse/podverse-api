import { parseFeed } from 'podcast-partytime';
import { request } from '@helpers/lib/request';
import { FeedService } from '@orm/services/feed/feed';
import { MediumValueService } from '@orm/services/mediumValue';
import { convertParsedRSSFeedToCompat } from '@parser-rss/lib/compat/compatFull';
import { checkIfFeedFlagStatusShouldParse } from '@orm/entities/feed/feedFlagStatus';
import { ChannelService } from '@orm/services/channel/channel';
import { createSortableTitle } from '@orm/lib/sortableTitle';
import { getMediumValueValueEnumValue, MediumValueValueEnum } from '@orm/entities/mediumValue';

const channelService = new ChannelService();
const feedService = new FeedService();
const mediumValueService = new MediumValueService();

/*
  NOTE: All RSS feeds that have a podcast_index_id will be saved to the database.
  RSS feeds without podcast_index_id (Add By RSS feeds) will NOT be saved to the database.
*/

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
  const compatData = convertParsedRSSFeedToCompat(parsedFeed);

  const feed = await feedService.getOrCreateFeed({ url, podcast_index_id });

  // TODO: check if already isParsing

  if (!checkIfFeedFlagStatusShouldParse(feed.feed_flag_status.id)) {
    throw new Error(`parseRSSFeedAndSaveToDatabase: feed_flag_status.status is not None or AlwaysAllow for ${url}`);
  }
  
  const channel = await channelService.getOrCreateByPodcastIndexId({ feed, podcast_index_id });

  const updateChannelDto = {
    podcast_guid: compatData.channel.guid,
    title: compatData.channel.title,
    sortable_title: createSortableTitle(compatData.channel.title),
    medium_value: getMediumValueValueEnumValue(compatData.channel.medium)
  }

  await channelService.update(channel.id, updateChannelDto);
  
  return compatData;
}

export const parseAllRSSFeeds = async () => {
  const feeds = await feedService.getAll();
  for (const feed of feeds) {
    return await parseRSSFeedAndSaveToDatabase(feed.url, feed?.channel?.podcast_index_id);
  }
}
