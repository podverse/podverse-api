import { Router } from 'express';
import { config } from '@api/config';
import { asyncHandler } from '@api/middleware/asyncHandler';
import { SearchPodcastIndexController } from '@api/controllers/search/searchPodcastIndex';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/search`, router);

router.get('/podcast-index/podcasts', asyncHandler(SearchPodcastIndexController.searchPodcasts));

export const searchRouter = router;
