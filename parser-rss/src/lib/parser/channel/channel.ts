import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { compatChannelDto, compatChannelSeasonDtos } from "@parser-rss/lib/compat/channel";
import { ChannelService } from "@orm/services/channel/channel";
import { handleParsedChannelAbout } from "@parser-rss/lib/parser/channel/channelAbout";
import { handleParsedChannelDescription } from "@parser-rss/lib/parser/channel/channelDescription";
import { handleParsedChannelFunding } from "@parser-rss/lib/parser/channel/channelFunding";
import { handleParsedChannelImage } from "@parser-rss/lib/parser/channel/channelImage";
import { handleParsedChannelLicense } from "@parser-rss/lib/parser/channel/channelLicense";
import { handleParsedChannelLocation } from "@parser-rss/lib/parser/channel/channelLocation";
import { handleParsedChannelPerson } from "@parser-rss/lib/parser/channel/channelPerson";
import { handleParsedChannelPodroll } from "@parser-rss/lib/parser/channel/channelPodroll";
import { handleParsedChannelRemoteItem } from "@parser-rss/lib/parser/channel/channelRemoteItem";
import { handleParsedChannelSocialInteract } from "@parser-rss/lib/parser/channel/channelSocialInteract";
import { handleParsedChannelTrailer } from "@parser-rss/lib/parser/channel/channelTrailer";
import { handleParsedChannelTxt } from "@parser-rss/lib/parser/channel/channelTxt";
import { handleParsedChannelValue } from "@parser-rss/lib/parser/channel/channelValue";
import { ChannelSeasonIndex, ChannelSeasonService } from "@orm/services/channel/channelSeason";

export const handleParsedChannel = async (parsedFeed: FeedObject, channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  const channelService = new ChannelService();
  const channelDto = compatChannelDto(parsedFeed);
  await channelService.update(channel.id, channelDto);
  
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

  await handleParsedChannelSocialInteract(parsedFeed, channel);
  await handleParsedChannelTrailer(parsedFeed, channel, channelSeasonIndex);
  await handleParsedChannelTxt(parsedFeed, channel);
  await handleParsedChannelValue(parsedFeed, channel);
}
