import { ItemValueTimeSplit } from '@orm/entities/item/itemValueTimeSplit';
import { ItemValueTimeSplitRemoteItem } from '@orm/entities/item/itemValueTimeSplitRemoteItem';
import { BaseRemoteItemsService } from '@orm/services/base/baseRemoteItemsService';

type ItemValueTimeSplitRemoteItemDto = {
  feed_guid: string
  feed_url: string | null
  item_guid: string | null
  // title: string | null
}

export class ItemValueTimeSplitRemoteItemService extends BaseRemoteItemsService<ItemValueTimeSplitRemoteItem, 'item_value_time_split'> {
  constructor() {
    super(ItemValueTimeSplitRemoteItem, 'item_value_time_split');
  }

  async update(item_value_time_split: ItemValueTimeSplit, dto: ItemValueTimeSplitRemoteItemDto): Promise<ItemValueTimeSplitRemoteItem> {
    return super.update(item_value_time_split, dto);
  }
}
