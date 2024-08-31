import { Item } from '@orm/entities/item/item';
import { ItemSeason } from '@orm/entities/item/itemSeason';
import { BaseOneService } from '../base/baseOneService';
import { ChannelSeason } from '@orm/entities/channel/channelSeason';

export type ItemSeasonDto = {
  title: string | null
  channel_season: ChannelSeason
}

export class ItemSeasonService extends BaseOneService<ItemSeason, 'item'> {
  constructor() {
    super(ItemSeason, 'item');
  }

  async update(item: Item, dto: ItemSeasonDto): Promise<ItemSeason> {
    return super._update(item, dto, { relations: ['channel_season'] });
  }
}
