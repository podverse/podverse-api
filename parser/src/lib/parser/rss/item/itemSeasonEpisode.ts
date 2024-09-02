import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemSeasonEpisodeService } from "@orm/services/item/itemSeasonEpisode";
import { compatItemSeasonEpisodeDto } from "@parser/lib/compat/partytime/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemSeasonEpisode = async (parsedItem: Episode, item: Item) => {
  const itemSeasonEpisodeService = new ItemSeasonEpisodeService();
  const itemSeasonEpisodeDto = compatItemSeasonEpisodeDto(parsedItem);
  await handleParsedOneData(item, itemSeasonEpisodeService, itemSeasonEpisodeDto);
}
