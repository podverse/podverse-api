import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelLocationService } from "@orm/services/channel/channelLocation";
import { compatChannelLocationDto } from "@parser-rss/lib/compat/channel";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedChannelLocation = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelLocationService = new ChannelLocationService();
  const channelLocationDtos = compatChannelLocationDto(parsedFeed);
  await handleParsedOneData(channel, channelLocationService, channelLocationDtos);
}
