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
  compatChannelTrailerDtos,
  compatChannelTxtDtos,
  compatChannelValueDtos} from '@parser-rss/lib/compat/channel';
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
import { ChannelTxtService } from '@orm/services/channel/channelTxt';
import { ChannelValueService } from '@orm/services/channel/channelValue';
import { ChannelValueRecipientService } from '@orm/services/channel/channelValueRecipient';
import { handleParsedChannelValue } from './channel/channelValue';
import { handleParsedChannelTxt } from './channel/channelTxt';
import { handleParsedChannelTrailer } from './channel/channelTrailer';
import { handleParsedChannelSocialInteract } from './channel/channelSocialInteract';
import { handleParsedChannelRemoteItem } from './channel/channelRemoteItem';
import { handleParsedChannelPodroll } from './channel/channelPodroll';
import { handleParsedChannelPerson } from './channel/channelPerson';
import { handleParsedChannelLocation } from './channel/channelLocation';
import { handleParsedChannelLicense } from './channel/channelLicense';
import { handleParsedChannelImage } from './channel/channelImage';
import { handleParsedChannelFunding } from './channel/channelFunding';
import { handleParsedChannelDescription } from './channel/channelDescription';
import { handleParsedChannelAbout } from './channel/channelAbout';
import { handleParsedChannel } from './channel/channel';
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
