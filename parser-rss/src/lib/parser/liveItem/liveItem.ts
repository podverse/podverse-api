import { Channel } from "@orm/entities/channel/channel";
import { ChannelSeasonIndex } from "@orm/services/channel/channelSeason";
import { Phase4PodcastLiveItem } from "podcast-partytime/dist/parser/phase/phase-4";
import { LiveItemService } from "@orm/services/liveItem/liveItem";
import { compatLiveItemsDtos } from "@parser-rss/lib/compat/liveItem";
import { handleParsedItem } from "../item/item";

export const handleParsedLiveItems = async (parsedLiveItems: Phase4PodcastLiveItem[], channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  const liveItemObjDtos = compatLiveItemsDtos(parsedLiveItems);

  for (const liveItemObjDto of liveItemObjDtos) {
    // TODO: how to make any unnecessary?
    const itemDto = liveItemObjDto.item as any;

    const item = await handleParsedItem(itemDto, channel, channelSeasonIndex);

    const liveItemService = new LiveItemService();
    const liveItemDto = liveItemObjDto.liveItem;
    await liveItemService.update(item, liveItemDto);
  }
}

