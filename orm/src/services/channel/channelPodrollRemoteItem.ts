import { ChannelPodroll } from '@orm/entities/channel/channelPodroll';
import { ChannelPodrollRemoteItem } from '@orm/entities/channel/channelPodrollRemoteItem';
import { MediumEnum } from '@orm/entities/medium';
import { BaseRemoteItemsService } from '@orm/services/base/baseRemoteItemsService';

type ChannelPodrollRemoteItemDto = {
  feed_guid: string
  feed_url: string | null
  item_guid: string | null
  // title: string | null
}

export class ChannelPodrollRemoteItemService extends BaseRemoteItemsService<ChannelPodrollRemoteItem, 'channel_podroll'> {
  constructor() {
    super(ChannelPodrollRemoteItem, 'channel_podroll');
  }

  async update(channel_podroll: ChannelPodroll, dto: ChannelPodrollRemoteItemDto): Promise<ChannelPodrollRemoteItem> {
    return super.update(channel_podroll, dto);
  }

  async updateMany(channel_podroll: ChannelPodroll, dtos: ChannelPodrollRemoteItemDto[]): Promise<ChannelPodrollRemoteItem[]> { 
    return super.updateMany(channel_podroll, dtos);
  }
}
