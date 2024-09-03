import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ChannelLicenseService } from "@orm/services/channel/channelLicense";
import { compatChannelLicenseDto } from "@parser/lib/compat/partytime/channel";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedChannelLicense = async (
  parsedFeed: FeedObject,
  channel: Channel,
  transactionalEntityManager: EntityManager
) => {
  const channelLicenseService = new ChannelLicenseService(transactionalEntityManager);
  const channelLicenseDtos = compatChannelLicenseDto(parsedFeed);
  await handleParsedOneData(channel, channelLicenseService, channelLicenseDtos);
};
