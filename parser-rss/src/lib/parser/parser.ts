import { parseFeed } from 'podcast-partytime';
import { request } from '@helpers/lib/request';
import { checkIfFeedFlagStatusShouldParse } from '@orm/entities/feed/feedFlagStatus';
import { ChannelService } from '@orm/services/channel/channel';
import { FeedService } from '@orm/services/feed/feed';
import { convertParsedRSSFeedToCompat } from '@parser-rss/lib/compat/compatFull';
import { handleParsedChannelValue } from '@parser-rss/lib/parser/channel/channelValue';
import { handleParsedChannelTxt } from '@parser-rss/lib/parser/channel/channelTxt';
import { handleParsedChannelTrailer } from '@parser-rss/lib/parser/channel/channelTrailer';
import { handleParsedChannelSocialInteract } from '@parser-rss/lib/parser/channel/channelSocialInteract';
import { handleParsedChannelRemoteItem } from '@parser-rss/lib/parser/channel/channelRemoteItem';
import { handleParsedChannelPodroll } from '@parser-rss/lib/parser/channel/channelPodroll';
import { handleParsedChannelPerson } from '@parser-rss/lib/parser/channel/channelPerson';
import { handleParsedChannelLocation } from '@parser-rss/lib/parser/channel/channelLocation';
import { handleParsedChannelLicense } from '@parser-rss/lib/parser/channel/channelLicense';
import { handleParsedChannelImage } from '@parser-rss/lib/parser/channel/channelImage';
import { handleParsedChannelFunding } from '@parser-rss/lib/parser/channel/channelFunding';
import { handleParsedChannelDescription } from '@parser-rss/lib/parser/channel/channelDescription';
import { handleParsedChannelAbout } from '@parser-rss/lib/parser/channel/channelAbout';
import { handleParsedChannel } from '@parser-rss/lib/parser/channel/channel';

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

  const feedService = new FeedService();
  const feed = await feedService.getOrCreate({ url, podcast_index_id });

  // TODO: check if already isParsing

  if (!checkIfFeedFlagStatusShouldParse(feed.feed_flag_status.id)) {
    throw new Error(`parseRSSFeedAndSaveToDatabase: feed_flag_status.status is not None or AlwaysAllow for ${url}`);
  }
  
  const channelService = new ChannelService();
  const channel = await channelService.getOrCreateByPodcastIndexId({ feed, podcast_index_id });

  await handleParsedChannel(parsedFeed, channel);
  await handleParsedChannelAbout(parsedFeed, channel);

  // TODO: add channelCategory support

  // TODO: add channelChat support

  await handleParsedChannelDescription(parsedFeed, channel);
  await handleParsedChannelFunding(parsedFeed, channel);
  await handleParsedChannelImage(parsedFeed, channel);
  await handleParsedChannelLicense(parsedFeed, channel);
  await handleParsedChannelLocation(parsedFeed, channel);
  await handleParsedChannelPerson(parsedFeed, channel);
  await handleParsedChannelPodroll(parsedFeed, channel);

  // const channelPublisherService = new ChannelPublisherService();
  // const channelPublisherRemoteItemService = new ChannelPublisherRemoteItemService();

  // const channelPublisherRemoteItemDtos = compatChannelPublisherRemoteItemDtos(parsedFeed);
  // if (channelPublisherRemoteItemDtos.length > 0) {
  //   const channel_publisher = await channelPublisherService.update(channel);
  //   await channelPublisherRemoteItemService.updateMany(channel_publisher, channelPodrollRemoteItemDtos);
  // } else {
  //   await channelPublisherService.delete(channel);
  // }

  await handleParsedChannelRemoteItem(parsedFeed, channel);

  // // TODO: add channelSeason support
  // const channelSeasonService = new ChannelSeasonService();
  // const channelSeasonDtos = compatChannelSeasonDtos(parsedFeed);

  // if (channelSeasonDtos.length > 0) {
  //   await channelSeasonService.updateMany(channel, channelSeasonDtos);
  // } else {
  //   await channelSeasonService.deleteAll(channel);
  // }

  await handleParsedChannelSocialInteract(parsedFeed, channel);
  await handleParsedChannelTrailer(parsedFeed, channel);
  await handleParsedChannelTxt(parsedFeed, channel);
  await handleParsedChannelValue(parsedFeed, channel);

  return feed;
}
