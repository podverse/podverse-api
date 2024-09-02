import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelSeasonService } from "@orm/services/channel/channelSeason";
import { compatChannelSeasonDtos } from "@parser-rss/lib/compat/partytime/channel";

export const handleParsedChannelSeasons = async (parsedFeed: FeedObject, channel: Channel): Promise<void> => {
  const channelSeasonService = new ChannelSeasonService();
  const channelSeasonDtos = compatChannelSeasonDtos(parsedFeed);
  
  if (channelSeasonDtos.length > 0) {
    await channelSeasonService.updateMany(channel, channelSeasonDtos);
  } else {
    await channelSeasonService._deleteAll(channel);
  }
}
