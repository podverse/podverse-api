import { AppDataSource } from '@orm/db';
import { ChannelPublisher } from '@orm/entities/channel/channelPublisher';
import { ChannelPublisherRemoteItem } from '@orm/entities/channel/channelPublisherRemoteItem';
import { MediumValueValueEnum } from '@orm/entities/mediumValue';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelPublisherRemoteItemDto = {
  feed_guid: string
  feed_url: string | null
  item_guid: string | null
  // title: string | null
  medium: MediumValueValueEnum | null
}

export class ChannelPublisherRemoteItemService {
  private repository = AppDataSource.getRepository(ChannelPublisherRemoteItem);

  async getAll(channel_publisher: ChannelPublisher): Promise<ChannelPublisherRemoteItem[]> {
    return this.repository.find({ where: { channel_publisher } });
  }

  async getByItemGuid(channel_publisher: ChannelPublisher, item_guid: string): Promise<ChannelPublisherRemoteItem | null> {
    return this.repository.findOne({ where: { channel_publisher, item_guid } });
  }

  async getByFeedGuid(channel_publisher: ChannelPublisher, feed_guid: string): Promise<ChannelPublisherRemoteItem | null> {
    return this.repository.findOne({ where: { channel_publisher, feed_guid } });
  }

  async getByFeedUrl(channel_publisher: ChannelPublisher, feed_url: string): Promise<ChannelPublisherRemoteItem | null> {
    return this.repository.findOne({ where: { channel_publisher, feed_url } });
  }

  async get(channel_publisher: ChannelPublisher, dto: ChannelPublisherRemoteItemDto): Promise<ChannelPublisherRemoteItem | null> {
    if (dto.item_guid) {
      return this.getByItemGuid(channel_publisher, dto.item_guid);
    } else if (dto.feed_guid) {
      return this.getByFeedGuid(channel_publisher, dto.feed_guid);
    } else if (dto.feed_url) {
      return this.getByFeedUrl(channel_publisher, dto.feed_url);
    }

    return null;
  }

  async update(channel_publisher: ChannelPublisher, dto: ChannelPublisherRemoteItemDto): Promise<ChannelPublisherRemoteItem> {
    let channel_publisher_remote_item = await this.get(channel_publisher, dto);

    if (!channel_publisher_remote_item) {
      channel_publisher_remote_item = new ChannelPublisherRemoteItem();
      channel_publisher_remote_item.channel_publisher = channel_publisher;
    }

    channel_publisher_remote_item = applyProperties(channel_publisher_remote_item, dto);

    return this.repository.save(channel_publisher_remote_item);
  }

  async updateMany(channel_publisher: ChannelPublisher,
    dtos: ChannelPublisherRemoteItemDto[]): Promise<ChannelPublisherRemoteItem[]> {
    const existingChannelPublisherRemoteItems = await this.getAll(channel_publisher);
    const updatedChannelPublisherRemoteItems: ChannelPublisherRemoteItem[] = [];
    const dtoUniqueKeys = dtos.map(dto => ({
      feed_guid: dto.feed_guid,
      feed_url: dto.feed_url,
      item_guid: dto.item_guid
    }));
  
    for (const dto of dtos) {
      const channel_publisher_remote_item = await this.update(channel_publisher, dto);
      updatedChannelPublisherRemoteItems.push(channel_publisher_remote_item);
    }
    
    await this.repository.save(updatedChannelPublisherRemoteItems);

    const channelPublisherRemoteItemsToDelete = existingChannelPublisherRemoteItems?.filter(channel_publisher_remote_item => 
      dtoUniqueKeys.every(key => 
        key.feed_guid !== channel_publisher_remote_item.feed_guid ||
        key.feed_url !== channel_publisher_remote_item.feed_url ||
        key.item_guid !== channel_publisher_remote_item.item_guid
      )
    );

    if (channelPublisherRemoteItemsToDelete && channelPublisherRemoteItemsToDelete.length > 0) {
      await this.repository.remove(channelPublisherRemoteItemsToDelete);
    }
    
    return updatedChannelPublisherRemoteItems;
  }

  async deleteAll(channel_publisher: ChannelPublisher): Promise<void> {
    const channel_publisher_remote_items = await this.getAll(channel_publisher);
    if (channel_publisher_remote_items) {
      await this.repository.remove(channel_publisher_remote_items);
    }
  }
}
