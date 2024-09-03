import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemSeasonEpisodeService } from "@orm/services/item/itemSeasonEpisode";
import { compatItemSeasonEpisodeDto } from "@parser/lib/compat/partytime/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemSeasonEpisode = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemSeasonEpisodeService = new ItemSeasonEpisodeService(transactionalEntityManager);
  const itemSeasonEpisodeDto = compatItemSeasonEpisodeDto(parsedItem);
  await handleParsedOneData(item, itemSeasonEpisodeService, itemSeasonEpisodeDto);
}
