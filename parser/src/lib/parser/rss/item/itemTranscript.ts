import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemTranscriptService } from "@orm/services/item/itemTranscript";
import { compatItemTranscriptDtos } from "@parser-rss/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemTranscript = async (parsedItem: Episode, item: Item) => {
  const itemTranscriptService = new ItemTranscriptService();
  const itemTranscriptDtos = compatItemTranscriptDtos(parsedItem);
  await handleParsedManyData(item, itemTranscriptService, itemTranscriptDtos);
}
