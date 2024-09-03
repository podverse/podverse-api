import { FeedObject } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ChannelValueService } from "@orm/services/channel/channelValue";
import { ChannelValueRecipientService } from "@orm/services/channel/channelValueRecipient";
import { compatChannelValueDtos } from "@parser/lib/compat/partytime/channel";

export const handleParsedChannelValue = async (
  parsedFeed: FeedObject,
  channel: Channel,
  transactionalEntityManager: EntityManager
) => {
  const channelValueService = new ChannelValueService(transactionalEntityManager);
  const channelValueDtos = compatChannelValueDtos(parsedFeed);
  const channelValueRecipientService = new ChannelValueRecipientService(transactionalEntityManager);
  
  if (channelValueDtos.length > 0) {
    for (const channelValueDto of channelValueDtos) {
      const channel_value = await channelValueService.update(channel, channelValueDto.channel_value);
      
      const channelValueRecipientDtos = channelValueDto.channel_value_recipients;
      if (channelValueRecipientDtos.length > 0) {
        for (const channelValueRecipientDto of channelValueRecipientDtos) {
          await channelValueRecipientService.update(channel_value, channelValueRecipientDto);
        }
      } else {
        await channelValueService._deleteAll(channel);
      }
    }
  } else {
    await channelValueService._deleteAll(channel);
  }
};
