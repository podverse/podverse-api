
import { request } from '@helpers/lib/request';

export const fetchRSS = async (url: string) => {
  const data = await request(url);
  return data
}
