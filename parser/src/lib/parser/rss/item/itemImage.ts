import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemImageService } from "@orm/services/item/itemImage";
import { compatItemImageDtos } from "@parser/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemImage = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemImageService = new ItemImageService(transactionalEntityManager);
  const itemImageDtos = compatItemImageDtos(parsedItem);
  await handleParsedManyData(item, itemImageService, itemImageDtos);
}
