import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelChatService } from "@orm/services/channel/channelChat";
import { compatChannelChatDto } from "@parser-rss/lib/compat/channel";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedChannelChat = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelChatService = new ChannelChatService();
  const channelChatDto = compatChannelChatDto(parsedFeed);
  await handleParsedOneData(channel, channelChatService, channelChatDto);
}
