import { parseFeed } from 'podcast-partytime';
import { request } from '@helpers/lib/request';
import { FeedService } from '@orm/services/feed/feed';
import { convertParsedRSSFeedToCompat } from '@parser-rss/lib/compat/compatFull';
import { checkIfFeedFlagStatusShouldParse } from '@orm/entities/feed/feedFlagStatus';
import { ChannelService } from '@orm/services/channel/channel';
import { ChannelAboutService } from '@orm/services/channel/channelAbout';
import { ChannelDescriptionService } from '@orm/services/channel/channelDescription';
import { compatChannelAboutDto, compatChannelDescriptionDto, compatChannelDto, compatChannelFundingDtos, compatChannelImageDtos, compatChannelLicense, compatChannelLocation } from '@parser-rss/lib/compat/channel';
import { ChannelFundingService } from '@orm/services/channel/channelFunding';
import { ChannelImageService } from '@orm/services/channel/channelImage';
import { ChannelLocationService } from '@orm/services/channel/channelLocation';
import { ChannelLicenseService } from '@orm/services/channel/channelLicense';

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
  const feed = await feedService.getOrCreateFeed({ url, podcast_index_id });

  // TODO: check if already isParsing

  if (!checkIfFeedFlagStatusShouldParse(feed.feed_flag_status.id)) {
    throw new Error(`parseRSSFeedAndSaveToDatabase: feed_flag_status.status is not None or AlwaysAllow for ${url}`);
  }
  
  const channelService = new ChannelService();
  const channel = await channelService.getOrCreateByPodcastIndexId({ feed, podcast_index_id });

  const channelDto = compatChannelDto(parsedFeed);
  await channelService.update(channel.id, channelDto);
  
  const channelAboutService = new ChannelAboutService();
  const channelAboutDto = compatChannelAboutDto(parsedFeed);
  await channelAboutService.createOrUpdate(channel, channelAboutDto);

  // TODO: add channelCategory support

  // TODO: add channelChat support

  const channelDescriptionService = new ChannelDescriptionService();
  const channelDescriptionDto = compatChannelDescriptionDto(parsedFeed);
  if (channelDescriptionDto) {
    await channelDescriptionService.createOrUpdate(channel, channelDescriptionDto);
  } else {
    await channelDescriptionService.deleteByChannel(channel);
  }

  const channelFundingService = new ChannelFundingService();
  const channelFundingDtos = compatChannelFundingDtos(parsedFeed);
  if (channelFundingDtos.length > 0) {
    await channelFundingService.createOrUpdateMany(channel, channelFundingDtos);
  } else {
    await channelFundingService.deleteAllByChannel(channel);
  }

  const channelImageService = new ChannelImageService();
  const channelImageDtos = compatChannelImageDtos(parsedFeed);
  if (channelImageDtos.length > 0) {
    await channelImageService.createOrUpdateMany(channel, channelImageDtos);
  } else {
    await channelImageService.deleteAllByChannel(channel);
  }

  const channelLicenseService = new ChannelLicenseService();
  const channelLicenseDto = compatChannelLicense(parsedFeed);
  if (channelLicenseDto) {
    await channelLicenseService.createOrUpdate(channel, channelLicenseDto);
  } else {
    await channelLicenseService.deleteByChannel(channel);
  }

  const channelLocationService = new ChannelLocationService();
  const channelLocationDto = compatChannelLocation(parsedFeed);
  if (channelLocationDto) {
    await channelLocationService.createOrUpdate(channel, channelLocationDto);
  } else {
    await channelLocationService.deleteByChannel(channel);
  }

  return feed;
}
