import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemAboutService } from "@orm/services/item/itemAbout";
import { compatItemAboutDto } from "@parser/lib/compat/partytime/item";

export const handleParsedItemAbout = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemAboutService = new ItemAboutService(transactionalEntityManager);
  const itemAboutDto = compatItemAboutDto(parsedItem);
  await itemAboutService.update(item, itemAboutDto);
};
