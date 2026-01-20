import { Router } from 'express';
import { config } from '@api/config';
import { ProfileContentController } from '@api/controllers/profileContent';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

// Public profile routes
router.use(`${config.api.prefix}${config.api.version}/profile`, router);
router.get('/:account_id_text/podcasts/az', asyncHandler(ProfileContentController.getProfilePodcastsAZ));
router.get('/:account_id_text/albums/az', asyncHandler(ProfileContentController.getProfileAlbumsAZ));
router.get('/:account_id_text/playlists/az', asyncHandler(ProfileContentController.getProfilePlaylistsAZ));
router.get('/:account_id_text/clips/recent', asyncHandler(ProfileContentController.getProfileClipsRecent));

// My profile routes
const myProfileRouter = Router();
myProfileRouter.use(`${config.api.prefix}${config.api.version}/my-profile`, myProfileRouter);
myProfileRouter.get('/podcasts/az', asyncHandler(ProfileContentController.getMyProfilePodcastsAZ));
myProfileRouter.get('/albums/az', asyncHandler(ProfileContentController.getMyProfileAlbumsAZ));
myProfileRouter.get('/playlists/az', asyncHandler(ProfileContentController.getMyProfilePlaylistsAZ));
myProfileRouter.get('/clips/recent', asyncHandler(ProfileContentController.getMyProfileClipsRecent));

export const profileContentRouter = router;
export const myProfileContentRouter = myProfileRouter;
