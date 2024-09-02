import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelRemoteItemService } from "@orm/services/channel/channelRemoteItem";
import { compatChannelRemoteItemDtos } from "@parser/lib/compat/partytime/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelRemoteItem = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelRemoteItemService = new ChannelRemoteItemService();
  const channelRemoteItemDtos = compatChannelRemoteItemDtos(parsedFeed);
  await handleParsedManyData(channel, channelRemoteItemService, channelRemoteItemDtos);
}
