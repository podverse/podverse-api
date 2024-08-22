import { parseFeed } from 'podcast-partytime';
import { request } from '@helpers/lib/request';
import { FeedService } from '@orm/services/feed/feed';
import { feedCompat } from '@parser-rss/lib/compat/feed';
import { itemCompat } from '@parser-rss/lib/compat/item';
import { liveItemCompat } from '@parser-rss/lib/compat/liveItem';
import { MediumValueService } from '@orm/services/mediumValue';

const feedService = new FeedService();
const mediumValueService = new MediumValueService();


// If a podcast_index_id is provided, then the parsed data
// will be saved to the database
export const parseRSSFeed = async (url: string, podcast_index_id?: number) => {
  const xml = await request(url);
  const parsedFeed = parseFeed(xml, { allowMissingGuid: true });

  if (!parsedFeed) {
    throw new Error('parsedFeed is undefined');
  }
  
  const feedData = feedCompat(parsedFeed);

  // const itemsData = parsedFeed.items.map(itemCompat)
  // console.log('itemsData', itemsData.length);
  // const liveItemsData = feedData.liveItems.map(liveItemCompat as any) // TODO: remove any
  // console.log('liveItemsData', liveItemsData.length);

  if (!podcast_index_id) {
    return parsedFeed;
  }

  const feed = await feedService.getOrCreateFeed({ url, podcast_index_id });

  return feed;
}

export const parseAllRSSFeeds = async () => {
  const feeds = await feedService.getAll();
  for (const feed of feeds) {
    return await parseRSSFeed(feed.url, feed?.channel?.podcast_index_id);
  }
}
