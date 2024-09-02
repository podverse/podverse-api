import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemPersonService } from "@orm/services/item/itemPerson";
import { compatItemPersonDtos } from "@parser/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemPerson = async (parsedItem: Episode, item: Item) => {
  const itemPersonService = new ItemPersonService();
  const itemPersonDtos = compatItemPersonDtos(parsedItem);
  await handleParsedManyData(item, itemPersonService, itemPersonDtos);
}
