import crypto from 'crypto';

export const getMd5Hash = (data: unknown): string => {
  const parsedFeedString = JSON.stringify(data);
  return crypto.createHash('md5').update(parsedFeedString).digest('hex');
};
