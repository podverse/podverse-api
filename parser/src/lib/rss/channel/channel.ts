import { FeedObject } from "podcast-partytime";
import { AppDataSource } from "@orm/db";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelService } from "@orm/services/channel/channel";
import { ChannelSeasonIndex } from "@orm/services/channel/channelSeason";
import { compatChannelDto } from "@parser/lib/compat/partytime/channel";
import { handleParsedChannelAbout } from "@parser/lib/rss/channel/channelAbout";
import { handleParsedChannelChat } from "@parser/lib/rss/channel/channelChat";
import { handleParsedChannelDescription } from "@parser/lib/rss/channel/channelDescription";
import { handleParsedChannelFunding } from "@parser/lib/rss/channel/channelFunding";
import { handleParsedChannelImage } from "@parser/lib/rss/channel/channelImage";
import { handleParsedChannelLicense } from "@parser/lib/rss/channel/channelLicense";
import { handleParsedChannelLocation } from "@parser/lib/rss/channel/channelLocation";
import { handleParsedChannelPerson } from "@parser/lib/rss/channel/channelPerson";
import { handleParsedChannelPodroll } from "@parser/lib/rss/channel/channelPodroll";
import { handleParsedChannelRemoteItem } from "@parser/lib/rss/channel/channelRemoteItem";
import { handleParsedChannelSocialInteract } from "@parser/lib/rss/channel/channelSocialInteract";
import { handleParsedChannelTrailer } from "@parser/lib/rss/channel/channelTrailer";
import { handleParsedChannelTxt } from "@parser/lib/rss/channel/channelTxt";
import { handleParsedChannelValue } from "@parser/lib/rss/channel/channelValue";

export const handleParsedChannel = async (parsedFeed: FeedObject, channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  const channelService = new ChannelService();
  const channelDto = compatChannelDto(parsedFeed);
  await channelService.update(channel.id, channelDto);
  
  // TODO: add channelCategory support
  
  await AppDataSource.manager.transaction(async transactionalEntityManager => {
    await handleParsedChannelAbout(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelChat(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelDescription(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelFunding(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelImage(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelLicense(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelLocation(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelPerson(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelPodroll(parsedFeed, channel, transactionalEntityManager);
  
    // PTDO: add channelPublisher support
    // const channelPublisherService = new ChannelPublisherService();
    // const channelPublisherRemoteItemService = new ChannelPublisherRemoteItemService();
  
    // const channelPublisherRemoteItemDtos = compatChannelPublisherRemoteItemDtos(parsedFeed);
    // if (channelPublisherRemoteItemDtos.length > 0) {
    //   const channel_publisher = await channelPublisherService.update(channel);
    //   await channelPublisherRemoteItemService.updateMany(channel_publisher, channelPodrollRemoteItemDtos);
    // } else {
    //   await channelPublisherService.delete(channel);
    // }
  
    await handleParsedChannelRemoteItem(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelSocialInteract(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelTrailer(parsedFeed, channel, channelSeasonIndex, transactionalEntityManager);
    await handleParsedChannelTxt(parsedFeed, channel, transactionalEntityManager);
    await handleParsedChannelValue(parsedFeed, channel, transactionalEntityManager);
  });
};
