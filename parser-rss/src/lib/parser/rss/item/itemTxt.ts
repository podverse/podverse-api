import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemTxtService } from "@orm/services/item/itemTxt";
import { compatItemTxtDtos } from "@parser-rss/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemTxt = async (parsedItem: Episode, item: Item) => {
  const itemTxtService = new ItemTxtService();
  const itemTxtDtos = compatItemTxtDtos(parsedItem);
  await handleParsedManyData(item, itemTxtService, itemTxtDtos);
}
