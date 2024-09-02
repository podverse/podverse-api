import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemSoundbiteService } from "@orm/services/item/itemSoundbite";
import { compatItemSoundbiteDtos } from "@parser/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemSoundbite = async (parsedItem: Episode, item: Item) => {
  const itemSoundbiteService = new ItemSoundbiteService();
  const itemSoundbiteDtos = compatItemSoundbiteDtos(parsedItem);
  await handleParsedManyData(item, itemSoundbiteService, itemSoundbiteDtos);
}
