import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelTxtService } from "@orm/services/channel/channelTxt";
import { compatChannelTxtDtos } from "@parser-rss/lib/compat/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelTxt = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelTxtService = new ChannelTxtService();
  const channelTxtDtos = compatChannelTxtDtos(parsedFeed);
  await handleParsedManyData(channel, channelTxtService, channelTxtDtos);
}
