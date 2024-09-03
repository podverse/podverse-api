import { Episode } from "podcast-partytime";
import { chunkArray } from "@helpers/lib/array";
import { AppDataSource } from "@orm/db";
import { Channel } from "@orm/entities/channel/channel";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemService } from "@orm/services/item/item";
import { ChannelSeasonIndex } from "@orm/services/channel/channelSeason";
import { handleParsedItemAbout } from "@parser/lib/parser/rss/item/itemAbout";
import { handleParsedItemChaptersFeed } from "@parser/lib/parser/rss/item/itemChaptersFeed";
import { handleParsedItemDescription } from "@parser/lib/parser/rss/item/itemDescription";
import { handleParsedItemEnclosure } from "@parser/lib/parser/rss/item/itemEnclosure";
import { handleParsedItemImage } from "@parser/lib/parser/rss/item/itemImage";
import { handleParsedItemLicense } from "@parser/lib/parser/rss/item/itemLicense";
import { handleParsedItemLocation } from "@parser/lib/parser/rss/item/itemLocation";
import { handleParsedItemPerson } from "@parser/lib/parser/rss/item/itemPerson";
import { handleParsedItemSeason } from "@parser/lib/parser/rss/item/itemSeason";
import { handleParsedItemSeasonEpisode } from "@parser/lib/parser/rss/item/itemSeasonEpisode";
import { handleParsedItemSocialInteract } from "@parser/lib/parser/rss/item/itemSocialInteract";
import { handleParsedItemSoundbite } from "@parser/lib/parser/rss/item/itemSoundbite";
import { handleParsedItemTranscript } from "@parser/lib/parser/rss/item/itemTranscript";
import { handleParsedItemTxt } from "@parser/lib/parser/rss/item/itemTxt";
import { handleParsedItemValue } from "@parser/lib/parser/rss/item/itemValue";
import { compatItemDto } from "@parser/lib/compat/partytime/item";
import { handleParsedItemChat } from "@parser/lib/parser/rss/item/itemChat";

export const handleParsedItems = async (parsedItems: Episode[], channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  const itemService = new ItemService();
  const existingItems = await itemService.getAllItemsByChannel(channel, { select: ['id'] });
  const existingItemIds = existingItems.map(item => item.id);
  const updatedItemIds: number[] = [];

  const parsedItemBatchs = chunkArray(parsedItems, 100);
  for (const parsedItemBatch of parsedItemBatchs) {
    await AppDataSource.manager.transaction(async transactionalEntityManager => {
      for (const parsedItem of parsedItemBatch) {
        const item = await handleParsedItem(
          parsedItem,
          channel,
          channelSeasonIndex,
          transactionalEntityManager
        );
        updatedItemIds.push(item.id);
      }
    });
  }

  const itemIdsToDelete = existingItemIds.filter(id => !updatedItemIds.includes(id));
  await itemService.deleteMany(itemIdsToDelete);
}

export const handleParsedItem = async (
  parsedItem: Episode,
  channel: Channel,
  channelSeasonIndex: ChannelSeasonIndex,
  transactionalEntityManager: EntityManager
) => {
  const itemService = new ItemService();
  const itemDto = compatItemDto(parsedItem);
  const item = await itemService.update(channel, itemDto);

  await handleParsedItemAbout(parsedItem, item, transactionalEntityManager);
  await handleParsedItemChaptersFeed(parsedItem, item, transactionalEntityManager);
  await handleParsedItemChat(parsedItem, item, transactionalEntityManager);

  // // PTDO: add itemContentLinkService support after partytime adds chat support
  // const itemContentLinkService = new ItemContentLinkService();
  // const itemContentLinkDtos = compatItemContentLinkDtos(parsedItem);
  // if (itemContentLinkDtos.length) {
  //   await itemContentLinkService.updateMany(item, itemContentLinkDtos);
  // } else {
  //   await itemContentLinkService._deleteAll(item);
  // }

  await handleParsedItemDescription(parsedItem, item, transactionalEntityManager);
  await handleParsedItemEnclosure(parsedItem, item, transactionalEntityManager);
  await handleParsedItemImage(parsedItem, item, transactionalEntityManager);
  await handleParsedItemLicense(parsedItem, item, transactionalEntityManager);
  await handleParsedItemLocation(parsedItem, item, transactionalEntityManager);
  await handleParsedItemPerson(parsedItem, item, transactionalEntityManager);
  await handleParsedItemSeason(parsedItem, item, channelSeasonIndex, transactionalEntityManager);
  await handleParsedItemSeasonEpisode(parsedItem, item, transactionalEntityManager);
  await handleParsedItemSocialInteract(parsedItem, item, transactionalEntityManager);
  await handleParsedItemSoundbite(parsedItem, item, transactionalEntityManager);
  await handleParsedItemTranscript(parsedItem, item, transactionalEntityManager);
  await handleParsedItemTxt(parsedItem, item, transactionalEntityManager);
  await handleParsedItemValue(parsedItem, item, transactionalEntityManager);

  return item;
}
