import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ChannelImageService } from "@orm/services/channel/channelImage";
import { compatChannelImageDtos } from "@parser/lib/compat/partytime/channel";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedChannelImage = async (
  parsedFeed: FeedObject,
  channel: Channel,
  transactionalEntityManager: EntityManager
) => {
  const channelImageService = new ChannelImageService(transactionalEntityManager);
  const channelImageDtos = compatChannelImageDtos(parsedFeed);
  await handleParsedManyData(channel, channelImageService, channelImageDtos);
}
