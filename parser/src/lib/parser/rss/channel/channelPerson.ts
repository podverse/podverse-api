import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelPersonService } from "@orm/services/channel/channelPerson";
import { compatChannelPersonDtos } from "@parser/lib/compat/partytime/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelPerson = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelPersonService = new ChannelPersonService();
  const channelPersonDtos = compatChannelPersonDtos(parsedFeed);
  await handleParsedManyData(channel, channelPersonService, channelPersonDtos);
}
