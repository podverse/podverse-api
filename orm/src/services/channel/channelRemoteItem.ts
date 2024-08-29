import { Channel } from '@orm/entities/channel/channel';
import { ChannelRemoteItem } from '@orm/entities/channel/channelRemoteItem';
import { MediumValueValueEnum } from '@orm/entities/mediumValue';
import { BaseRemoteItemsService } from '@orm/services/base/baseRemoteItemsService';

type ChannelRemoteItemDto = {
  feed_guid: string
  feed_url: string | null
  item_guid: string | null
  // title: string | null
  medium: MediumValueValueEnum | null
}

export class ChannelRemoteItemService extends BaseRemoteItemsService<ChannelRemoteItem, 'channel'> {
  constructor() {
    super(ChannelRemoteItem, 'channel');
  }

  async update(channel: Channel, dto: ChannelRemoteItemDto): Promise<ChannelRemoteItem> {
    return super.update(channel, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelRemoteItemDto[]): Promise<ChannelRemoteItem[]> { 
    return super.updateMany(channel, dtos);
  }
}
