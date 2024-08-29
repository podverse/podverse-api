import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelTrailerService } from "@orm/services/channel/channelTrailer";
import { compatChannelTrailerDtos } from "@parser-rss/lib/compat/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelTrailer = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelTrailerService = new ChannelTrailerService();
  const channelTrailerDtos = compatChannelTrailerDtos(parsedFeed);
  await handleParsedManyData(channel, channelTrailerService, channelTrailerDtos);
}
