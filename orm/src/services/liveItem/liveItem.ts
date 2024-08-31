import { Item } from '@orm/entities/item/item';
import { LiveItem } from '@orm/entities/liveItem/liveItem';
import { LiveItemStatusEnum } from '@orm/entities/liveItem/liveItemStatus';
import { BaseOneService } from '../base/baseOneService';

type LiveItemDto = {
  live_item_status: LiveItemStatusEnum
  start_time: Date
  end_time: Date | null
}

export class LiveItemService extends BaseOneService<LiveItem, 'item'> {
  constructor() {
    super(LiveItem, 'item');
  }

  async update(item: Item, dto: LiveItemDto): Promise<LiveItem> {
    return super._update(item, dto);
  }
}
