import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemDescriptionService } from "@orm/services/item/itemDescription";
import { compatItemDescriptionDto } from "@parser/lib/compat/partytime/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemDescription = async (parsedItem: Episode, item: Item) => {
  const itemDescriptionService = new ItemDescriptionService();
  const itemDescriptionDto = compatItemDescriptionDto(parsedItem);
  await handleParsedOneData(item, itemDescriptionService, itemDescriptionDto);
}
