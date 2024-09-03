import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ChannelAboutService } from "@orm/services/channel/channelAbout";
import { compatChannelAboutDto } from "@parser/lib/compat/partytime/channel";

export const handleParsedChannelAbout = async (
  parsedFeed: FeedObject,
  channel: Channel,
  transactionalEntityManager: EntityManager
) => {
  const channelAboutService = new ChannelAboutService(transactionalEntityManager);
  const channelAboutDto = compatChannelAboutDto(parsedFeed);
  await channelAboutService.update(channel, channelAboutDto);
}
