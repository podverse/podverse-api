import { EntityManager } from 'typeorm';
import { Item } from '@orm/entities/item/item';
import { ItemImage } from '@orm/entities/item/itemImage';
import { filterDtosByHighestWidth } from '@orm/lib/filterImageDtosByHighestWidth';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemImageDto = {
  url: string
  image_width_size: number | null
}

export class ItemImageService extends BaseManyService<ItemImage, 'item'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ItemImage, 'item', transactionalEntityManager);
  }

  async update(item: Item, dto: ItemImageDto): Promise<ItemImage> {
    const whereKeys = ['url'] as (keyof ItemImage)[];
    return super._update(item, whereKeys, dto);
  }

  async updateMany(item: Item, dtos: ItemImageDto[]): Promise<ItemImage[]> {
    // TODO: adding image shrinking if an image < 500px is not found
    
    const filteredDtos = filterDtosByHighestWidth(dtos);
    const whereKeys = ['url'] as (keyof ItemImage)[];
    return super._updateMany(item, whereKeys, filteredDtos);
  }
}
