import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ChannelFundingService } from "@orm/services/channel/channelFunding";
import { compatChannelFundingDtos } from "@parser/lib/compat/partytime/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelFunding = async (
  parsedFeed: FeedObject,
  channel: Channel,
  transactionalEntityManager: EntityManager
) => {
  const channelFundingService = new ChannelFundingService(transactionalEntityManager);
  const channelFundingDtos = compatChannelFundingDtos(parsedFeed);
  await handleParsedManyData(channel, channelFundingService, channelFundingDtos);
}
