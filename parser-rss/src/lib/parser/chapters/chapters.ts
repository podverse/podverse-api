import { request } from "@helpers/lib/request"
import { Item } from "@orm/entities/item/item";
import { ItemChapterService } from "@orm/services/item/itemChapter";
import { ItemChaptersFeedService } from "@orm/services/item/itemChaptersFeed";
import { compatParsedChapters } from "@parser-rss/lib/compat/chapters/chapters";

// TODO: add strict typing for chapter parsing

const getParsedChapters = async (url: string) => {
  const response = await request(url);
  return compatParsedChapters(response.chapters)
}

export const parseChapters = async (item: Item): Promise<void> => {
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
