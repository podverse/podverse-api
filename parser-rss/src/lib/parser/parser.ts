import { parseFeed } from 'podcast-partytime';
import { request } from '@helpers/lib/request';
import { FeedService } from '@orm/services/feed/feed';
import { convertParsedRSSFeedToCompat } from '@parser-rss/lib/compat/compatFull';
import { checkIfFeedFlagStatusShouldParse } from '@orm/entities/feed/feedFlagStatus';
import { ChannelService } from '@orm/services/channel/channel';
import { ChannelAboutService } from '@orm/services/channel/channelAbout';
import { ChannelDescriptionService } from '@orm/services/channel/channelDescription';
import { compatChannelAboutDto, compatChannelDescriptionDto, compatChannelDto, compatChannelFundingDtos, compatChannelImageDtos,
  compatChannelLicenseDto, compatChannelLocationDto, compatChannelPersonDtos, 
  compatChannelPodrollRemoteItemDtos,
  compatChannelRemoteItemDtos,
  compatChannelSocialInteractDtos,
  compatChannelTrailerDtos} from '@parser-rss/lib/compat/channel';
import { ChannelFundingService } from '@orm/services/channel/channelFunding';
import { ChannelImageService } from '@orm/services/channel/channelImage';
import { ChannelLocationService } from '@orm/services/channel/channelLocation';
import { ChannelLicenseService } from '@orm/services/channel/channelLicense';
import { ChannelPersonService } from '@orm/services/channel/channelPerson';
import { ChannelPodrollRemoteItemService } from '@orm/services/channel/channelPodrollRemoteItem';
import { ChannelPodrollService } from '@orm/services/channel/channelPodroll';
import { ChannelRemoteItemService } from '@orm/services/channel/channelRemoteItem';
import { ChannelSocialInteractService } from '@orm/services/channel/channelSocialInteract';
import { ChannelTrailerService } from '@orm/services/channel/channelTrailer';
// import { ChannelSeasonService } from '@orm/services/channel/channelSeason';

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

  const channelDto = compatChannelDto(parsedFeed);
  await channelService.update(channel.id, channelDto);
  
  const channelAboutService = new ChannelAboutService();
  const channelAboutDto = compatChannelAboutDto(parsedFeed);
  await channelAboutService.update(channel, channelAboutDto);

  // TODO: add channelCategory support

  // TODO: add channelChat support

  const channelDescriptionService = new ChannelDescriptionService();
  const channelDescriptionDto = compatChannelDescriptionDto(parsedFeed);

  if (channelDescriptionDto) {
    await channelDescriptionService.update(channel, channelDescriptionDto);
  } else {
    await channelDescriptionService._delete(channel);
  }

  const channelFundingService = new ChannelFundingService();
  const channelFundingDtos = compatChannelFundingDtos(parsedFeed);

  if (channelFundingDtos.length > 0) {
    await channelFundingService.updateMany(channel, channelFundingDtos);
  } else {
    await channelFundingService._deleteAll(channel);
  }

  const channelImageService = new ChannelImageService();
  const channelImageDtos = compatChannelImageDtos(parsedFeed);

  if (channelImageDtos.length > 0) {
    await channelImageService.updateMany(channel, channelImageDtos);
  } else {
    await channelImageService._deleteAll(channel);
  }

  const channelLicenseService = new ChannelLicenseService();
  const channelLicenseDto = compatChannelLicenseDto(parsedFeed);

  if (channelLicenseDto) {
    await channelLicenseService.update(channel, channelLicenseDto);
  } else {
    await channelLicenseService._delete(channel);
  }

  const channelLocationService = new ChannelLocationService();
  const channelLocationDto = compatChannelLocationDto(parsedFeed);

  if (channelLocationDto) {
    await channelLocationService.update(channel, channelLocationDto);
  } else {
    await channelLocationService._delete(channel);
  }

  const channelPersonService = new ChannelPersonService();
  const channelPersonDtos = compatChannelPersonDtos(parsedFeed);

  if (channelPersonDtos.length > 0) {
    await channelPersonService.updateMany(channel, channelPersonDtos);
  } else {
    await channelPersonService._deleteAll(channel);
  }

  const channelPodrollService = new ChannelPodrollService();
  const channelPodrollDto = {};
  const channelPodrollRemoteItemService = new ChannelPodrollRemoteItemService();
  const channelPodrollRemoteItemDtos = compatChannelPodrollRemoteItemDtos(parsedFeed);

  if (channelPodrollRemoteItemDtos.length > 0) {
    const channel_podroll = await channelPodrollService.update(channel, channelPodrollDto);
    await channelPodrollRemoteItemService.updateMany(channel_podroll, channelPodrollRemoteItemDtos);
  } else {
    await channelPodrollService._delete(channel);
  }

  // const channelPublisherService = new ChannelPublisherService();
  // const channelPublisherRemoteItemService = new ChannelPublisherRemoteItemService();

  // const channelPublisherRemoteItemDtos = compatChannelPublisherRemoteItemDtos(parsedFeed);
  // if (channelPublisherRemoteItemDtos.length > 0) {
  //   const channel_publisher = await channelPublisherService.update(channel);
  //   await channelPublisherRemoteItemService.updateMany(channel_publisher, channelPodrollRemoteItemDtos);
  // } else {
  //   await channelPublisherService.delete(channel);
  // }

  // TODO: add channelRemoteItem support
  const channelRemoteItemService = new ChannelRemoteItemService();
  const channelRemoteItemDtos = compatChannelRemoteItemDtos(parsedFeed);

  if (channelRemoteItemDtos.length > 0) {
    await channelRemoteItemService.updateMany(channel, channelRemoteItemDtos);
  } else {
    await channelRemoteItemService._deleteAll(channel);
  }

  // // TODO: add channelSeason support
  // const channelSeasonService = new ChannelSeasonService();
  // const channelSeasonDtos = compatChannelSeasonDtos(parsedFeed);

  // if (channelSeasonDtos.length > 0) {
  //   await channelSeasonService.updateMany(channel, channelSeasonDtos);
  // } else {
  //   await channelSeasonService.deleteAll(channel);
  // }

  const channelSocialInteractService = new ChannelSocialInteractService();
  const channelSocialInteractDtos = compatChannelSocialInteractDtos(parsedFeed);

  if (channelSocialInteractDtos.length > 0) {
    await channelSocialInteractService.updateMany(channel, channelSocialInteractDtos);
  } else {
    await channelSocialInteractService._deleteAll(channel);
  }

  const channelTrailerService = new ChannelTrailerService();
  const channelTrailerDtos = compatChannelTrailerDtos(parsedFeed);

  if (channelTrailerDtos.length > 0) {
    await channelTrailerService.updateMany(channel, channelTrailerDtos);
  } else {
    await channelTrailerService._deleteAll(channel);
  }

  // TODO: add channelTxt support

  // TODO: add channelValueTag support
  // TODO: add channelValueTagRecipient support
  // TODO: add channelValueTagTimeSplit support
  // TODO: add channelValueTagTimeSplitRecipient support
  // TODO: add channelValueTagTimeSplitRemoteItem support

  return feed;
}
