import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { compatChannelDto } from "@parser-rss/lib/compat/channel";
import { ChannelService } from "@orm/services/channel/channel";

export const handleParsedChannel = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelService = new ChannelService();
  const channelDto = compatChannelDto(parsedFeed);
  await channelService.update(channel.id, channelDto);
}
