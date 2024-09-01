import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelSocialInteractService } from "@orm/services/channel/channelSocialInteract";
import { compatChannelSocialInteractDtos } from "@parser-rss/lib/compat/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelSocialInteract = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelSocialInteractService = new ChannelSocialInteractService();
  const channelSocialInteractDtos = compatChannelSocialInteractDtos(parsedFeed);
  await handleParsedManyData(channel, channelSocialInteractService, channelSocialInteractDtos);
}
