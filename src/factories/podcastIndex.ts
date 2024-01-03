import { PodcastIndexService } from 'podverse-external-services'
import { config } from '../config'

export const podcastIndexInstance = new PodcastIndexService({
  authKey: config.podcastIndex.authKey,
  baseUrl: config.podcastIndex.baseUrl,
  secretKey: config.podcastIndex.secretKey,
  userAgent: config.userAgent
})
