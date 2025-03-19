import { Router } from 'express';
import { config } from '@api/config';
import { StatsTrackEventChannelController } from '@api/controllers/stats/statsTrackEventChannel';
import { asyncHandler } from '@api/middleware/asyncHandler';
import { StatsTrackEventAccountController } from '@api/controllers/stats/statsTrackEventAccount';
import { StatsTrackEventClipController } from '@api/controllers/stats/statsTrackEventClip';
import { StatsTrackEventItemController } from '@api/controllers/stats/statsTrackEventItem';
import { StatsTrackEventPlaylistController } from '@api/controllers/stats/statsTrackEventPlaylist';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/stats`, router);

router.post('/account', asyncHandler(StatsTrackEventAccountController.create));
router.post('/channel', asyncHandler(StatsTrackEventChannelController.create));
router.post('/clip', asyncHandler(StatsTrackEventClipController.create));
router.post('/item', asyncHandler(StatsTrackEventItemController.create));
router.post('/playlist', asyncHandler(StatsTrackEventPlaylistController.create));

export const statsRouter = router;
