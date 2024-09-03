import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemChaptersFeedService } from "@orm/services/item/itemChaptersFeed";
import { compatItemChaptersFeedDto } from "@parser/lib/compat/partytime/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemChaptersFeed = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemChaptersFeedService = new ItemChaptersFeedService(transactionalEntityManager);
  const itemChaptersFeedDto = compatItemChaptersFeedDto(parsedItem);
  await handleParsedOneData(item, itemChaptersFeedService, itemChaptersFeedDto);
};
