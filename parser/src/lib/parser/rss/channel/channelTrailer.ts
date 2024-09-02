import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelTrailerDto, ChannelTrailerService } from "@orm/services/channel/channelTrailer";
import { compatChannelTrailerDtos } from "@parser-rss/lib/compat/partytime/channel";
import { ChannelSeason } from "@orm/entities/channel/channelSeason";

export const handleParsedChannelTrailer = async (
  parsedFeed: FeedObject,
  channel: Channel,
  channelSeasonIndex: Record<number, ChannelSeason>
) => {
  const channelTrailerService = new ChannelTrailerService();
  const channelTrailerDtos = compatChannelTrailerDtos(parsedFeed);

  const enrichedChannelTrailerDtos: ChannelTrailerDto[] = channelTrailerDtos.map((channelTrailerDto) => {
    const channel_season = channelTrailerDto.season ? channelSeasonIndex[channelTrailerDto.season] : null;
    return {
      url: channelTrailerDto.url,
      pubdate: channelTrailerDto.pubdate,
      title: channelTrailerDto.title,
      length: channelTrailerDto.length,
      type: channelTrailerDto.type,
      channel_season
    }
  })

  if (channelTrailerDtos.length > 0) {
    await channelTrailerService.updateMany(channel, enrichedChannelTrailerDtos);
  } else {
    await channelTrailerService._deleteAll(channel);
  }
}
