import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemLocationService } from "@orm/services/item/itemLocation";
import { compatItemLocationDto } from "@parser-rss/lib/compat/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemLocation = async (parsedItem: Episode, item: Item) => {
  const itemLocationService = new ItemLocationService();
  const itemLocationDto = compatItemLocationDto(parsedItem);
  await handleParsedOneData(item, itemLocationService, itemLocationDto);
}
