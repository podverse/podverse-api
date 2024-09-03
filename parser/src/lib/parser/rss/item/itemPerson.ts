import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemPersonService } from "@orm/services/item/itemPerson";
import { compatItemPersonDtos } from "@parser/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemPerson = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemPersonService = new ItemPersonService(transactionalEntityManager);
  const itemPersonDtos = compatItemPersonDtos(parsedItem);
  await handleParsedManyData(item, itemPersonService, itemPersonDtos);
};
