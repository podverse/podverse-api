import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelLicenseService } from "@orm/services/channel/channelLicense";
import { compatChannelLicenseDto } from "@parser-rss/lib/compat/partytime/channel";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedChannelLicense = async (parsedFeed: FeedObject, channel: Channel) => {
  const channelLicenseService = new ChannelLicenseService();
  const channelLicenseDtos = compatChannelLicenseDto(parsedFeed);
  await handleParsedOneData(channel, channelLicenseService, channelLicenseDtos);
}
