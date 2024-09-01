import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelAboutService } from "@orm/services/channel/channelAbout";
import { compatChannelAboutDto } from "@parser-rss/lib/compat/channel";

export const handleParsedChannelAbout = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelAboutService = new ChannelAboutService();
  const channelAboutDto = compatChannelAboutDto(parsedFeed);
  await channelAboutService.update(channel, channelAboutDto);
}
