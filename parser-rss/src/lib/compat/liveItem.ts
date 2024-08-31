import { getLiveItemStatusEnumValue, LiveItemStatusEnum } from "@orm/entities/liveItem/liveItemStatus"
import { Phase4PodcastLiveItem } from "podcast-partytime/dist/parser/phase/phase-4"

export const compatLiveItemsDtos = (parsedLiveItems: Phase4PodcastLiveItem[]) => {
  const dtos = []
  for (const parsedLiveItem of parsedLiveItems) {    
    dtos.push({
      liveItem: {
        live_item_status: getLiveItemStatusEnumValue(parsedLiveItem.status) ?? LiveItemStatusEnum.Pending,
        start_time: parsedLiveItem.start,
        end_time: parsedLiveItem.end || null
      },
      item: parsedLiveItem
    })
  }

  return dtos
}
