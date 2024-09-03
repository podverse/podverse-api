import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemLocationService } from "@orm/services/item/itemLocation";
import { compatItemLocationDto } from "@parser/lib/compat/partytime/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemLocation = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemLocationService = new ItemLocationService(transactionalEntityManager);
  const itemLocationDto = compatItemLocationDto(parsedItem);
  await handleParsedOneData(item, itemLocationService, itemLocationDto);
}
