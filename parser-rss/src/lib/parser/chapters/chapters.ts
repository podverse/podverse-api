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
  const item_chapters_feed = item.item_chapters_feed

  if (!item_chapters_feed) {
    return
  }

  const url = item_chapters_feed.url
  const parsedChapters = await getParsedChapters(url);
  
  const itemChapterService = new ItemChapterService()

  const existingChapters = await itemChapterService._getAll(item_chapters_feed, { select: ['id'] });
  const existingChaptersIds = existingChapters.map(item_chapter => item_chapter.id);
  const updatedChaptersIds: number[] = [];

  for (const parsedChapter of parsedChapters) {
    await itemChapterService.update(item_chapters_feed, parsedChapter);
    updatedChaptersIds.push(item_chapters_feed.id);
  }

  const itemChapterIdsToDelete = existingChaptersIds.filter(id => !updatedChaptersIds.includes(id));
  await itemChapterService.deleteMany(itemChapterIdsToDelete);
  
  // TODO: handle chapter feed logging
}
