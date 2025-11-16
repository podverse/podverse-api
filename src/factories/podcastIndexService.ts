
import { PodcastIndexService } from 'podverse-external-services';
import { loggerService } from './loggerService';
import { config } from '../config';

export const podcastIndexService = new PodcastIndexService({
  userAgent: config.userAgent,
  authKey: config.podcastIndex.authKey,
  baseUrl: config.podcastIndex.baseUrl,
  secretKey: config.podcastIndex.secretKey,
  loggerService
});
