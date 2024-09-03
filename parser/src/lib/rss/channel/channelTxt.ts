import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ChannelTxtService } from "@orm/services/channel/channelTxt";
import { compatChannelTxtDtos } from "@parser/lib/compat/partytime/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelTxt = async (
  parsedFeed: FeedObject,
  channel: Channel,
  transactionalEntityManager: EntityManager
) => {
  const channelTxtService = new ChannelTxtService(transactionalEntityManager);
  const channelTxtDtos = compatChannelTxtDtos(parsedFeed);
  await handleParsedManyData(channel, channelTxtService, channelTxtDtos);
};
