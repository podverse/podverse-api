import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemTxtService } from "@orm/services/item/itemTxt";
import { compatItemTxtDtos } from "@parser/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemTxt = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemTxtService = new ItemTxtService(transactionalEntityManager);
  const itemTxtDtos = compatItemTxtDtos(parsedItem);
  await handleParsedManyData(item, itemTxtService, itemTxtDtos);
};