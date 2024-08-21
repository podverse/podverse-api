import { parseFeed } from 'podcast-partytime';
import { request } from '@helpers/lib/request';
import { FeedService } from '@orm/services/feed/feed';
import { feedCompat } from '@parser-rss/lib/compat/feed';
import { itemCompat } from '@parser-rss/lib/compat/item';
import { liveItemCompat } from '@parser-rss/lib/compat/liveItem';
import { MediumValueService } from '@orm/services/mediumValue';

const feedService = new FeedService();
const mediumValueService = new MediumValueService();

export const parseRSSFeed = async (url: string) => {
  const xml = await request(url);
  
  const parsedFeed = parseFeed(xml, { allowMissingGuid: true });

  if (!parsedFeed) {
    throw new Error('parsedFeed is undefined');
  }
  
  const feedData = feedCompat(parsedFeed);
  console.log('feedData', typeof feedData);
  // const itemsData = parsedFeed.items.map(itemCompat)
  // console.log('itemsData', itemsData.length);
  // const liveItemsData = feedData.liveItems.map(liveItemCompat as any) // TODO: remove any
  // console.log('liveItemsData', liveItemsData.length);

  await feedService.create(url);

  return parsedFeed;
}


