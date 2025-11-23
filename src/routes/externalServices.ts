import { Router } from 'express';
import { config } from '@api/config';
import { asyncHandler } from '@api/middleware/asyncHandler';
import { PodcastIndexController } from '@api/controllers/externalServices/podcastIndex';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/external-services`, router);

router.get('/podcast-index/feed/:podcast_index_id', asyncHandler(PodcastIndexController.podcastById));

router.get('/podcast-index/search/podcasts', asyncHandler(PodcastIndexController.searchPodcasts));

export const externalServicesRouter = router;
