import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemSeasonDto, ItemSeasonService } from "@orm/services/item/itemSeason";
import { compatItemSeasonDto } from "@parser-rss/lib/compat/item";
import { handleParsedOneData } from "../base/handleParsedOneData";
import { ChannelSeasonIndex } from "@orm/services/channel/channelSeason";

export const handleParsedItemSeason = async (parsedItem: Episode, item: Item, channelSeasonIndex: ChannelSeasonIndex) => {
  const itemSeasonService = new ItemSeasonService();
  const itemSeasonDto = compatItemSeasonDto(parsedItem);

  if (itemSeasonDto) {
    const channel_season = itemSeasonDto.number ? channelSeasonIndex[itemSeasonDto.number] : null;
    if (channel_season) {
      const enrichedItemSeasonDto: ItemSeasonDto = {
        title: itemSeasonDto.title,
        channel_season
      }
      await handleParsedOneData(item, itemSeasonService, enrichedItemSeasonDto);
    }
  }
}
