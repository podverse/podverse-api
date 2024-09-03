import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ChannelPersonService } from "@orm/services/channel/channelPerson";
import { compatChannelPersonDtos } from "@parser/lib/compat/partytime/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelPerson = async (
  parsedFeed: FeedObject,
  channel: Channel,
  transactionalEntityManager: EntityManager
) => {
  const channelPersonService = new ChannelPersonService(transactionalEntityManager);
  const channelPersonDtos = compatChannelPersonDtos(parsedFeed);
  await handleParsedManyData(channel, channelPersonService, channelPersonDtos);
}
