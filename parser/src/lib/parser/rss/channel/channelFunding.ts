import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelFundingService } from "@orm/services/channel/channelFunding";
import { compatChannelFundingDtos } from "@parser-rss/lib/compat/partytime/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelFunding = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelFundingService = new ChannelFundingService();
  const channelFundingDtos = compatChannelFundingDtos(parsedFeed);
  await handleParsedManyData(channel, channelFundingService, channelFundingDtos);
}
