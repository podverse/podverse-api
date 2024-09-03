import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ChannelLocationService } from "@orm/services/channel/channelLocation";
import { compatChannelLocationDto } from "@parser/lib/compat/partytime/channel";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedChannelLocation = async (
  parsedFeed: FeedObject,
  channel: Channel,
  transactionalEntityManager: EntityManager
) => {
  const channelLocationService = new ChannelLocationService(transactionalEntityManager);
  const channelLocationDtos = compatChannelLocationDto(parsedFeed);
  await handleParsedOneData(channel, channelLocationService, channelLocationDtos);
}
