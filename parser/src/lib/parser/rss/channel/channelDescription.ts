import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ChannelDescriptionService } from "@orm/services/channel/channelDescription";
import { compatChannelDescriptionDto } from "@parser/lib/compat/partytime/channel";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedChannelDescription = async (
  parsedFeed: FeedObject,
  channel: Channel,
  transactionalEntityManager: EntityManager
) => {
  const channelDescriptionService = new ChannelDescriptionService(transactionalEntityManager);
  const channelDescriptionDto = compatChannelDescriptionDto(parsedFeed);
  await handleParsedOneData(channel, channelDescriptionService, channelDescriptionDto);
}
