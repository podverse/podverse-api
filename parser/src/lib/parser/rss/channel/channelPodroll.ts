import { Channel } from "@orm/entities/channel/channel";
import { ChannelPodrollService } from "@orm/services/channel/channelPodroll";
import { ChannelPodrollRemoteItemService } from "@orm/services/channel/channelPodrollRemoteItem";
import { compatChannelPodrollRemoteItemDtos } from "@parser/lib/compat/partytime/channel";
import { FeedObject } from "podcast-partytime";

export const handleParsedChannelPodroll = async (parsedFeed: FeedObject, channel: Channel) => {
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
}
