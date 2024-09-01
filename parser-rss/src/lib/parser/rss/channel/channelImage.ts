import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelImageService } from "@orm/services/channel/channelImage";
import { compatChannelImageDtos } from "@parser-rss/lib/compat/partytime/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelImage = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelImageService = new ChannelImageService();
  const channelImageDtos = compatChannelImageDtos(parsedFeed);
  await handleParsedManyData(channel, channelImageService, channelImageDtos);
}
