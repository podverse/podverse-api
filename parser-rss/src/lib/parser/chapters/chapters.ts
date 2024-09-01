import { request } from "@helpers/lib/request"
import { Item } from "@orm/entities/item/item";
import { ItemChapterService } from "@orm/services/item/itemChapter";
import { ItemChaptersFeedService } from "@orm/services/item/itemChaptersFeed";

// TODO: add strict typing for chapter parsing

const getParsedChapters = async (url: string) => {
  const response = await request(url);
  return response.chapters
}

export const parseChapters = async (item: Item): Promise<void> => {
  console.log('parseChapters', item.id)
  if (!item.item_chapters_feed) {
    return
  }

  const url = item.item_chapters_feed.url
  const parsedChapters = await getParsedChapters(url);
  
  console.log('parsedChapters', parsedChapters)

  const itemChapterService = new ItemChapterService()
  await itemChapterService.updateMany(item.item_chapters_feed, parsedChapters)
  
  // TODO: get and delete the old chapters
  // TODO: handle chapter feed logging
}
