import { Item } from '@orm/entities/item/item';
import { ItemSeasonEpisode } from '@orm/entities/item/itemSeasonEpisode';
import { BaseOneService } from '../base/baseOneService';

type ItemSeasonEpisodeDto = {
  display: string | null
  episode: number
}

export class ItemSeasonEpisodeService extends BaseOneService<ItemSeasonEpisode, 'item'> {
  constructor() {
    super(ItemSeasonEpisode, 'item');
  }

  async update(item: Item, dto: ItemSeasonEpisodeDto): Promise<ItemSeasonEpisode> {
    return super._update(item, dto);
  }
}