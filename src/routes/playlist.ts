import { Router } from 'express';
import { config } from '@api/config';
import { PlaylistController } from '@api/controllers/playlist/playlist';
import { PlaylistResourceController } from '@api/controllers/playlist/playlistResource';
import { PlaylistResourceClipController } from '@api/controllers/playlist/playlistResourceClip';
import { PlaylistResourceItemController } from '@api/controllers/playlist/playlistResourceItem';
import { asyncHandler } from '@api/middleware/asyncHandler';
import { PlaylistResourceItemAddByRSSController } from '@api/controllers/playlist/playlistResourceItemAddByRSS';
import { PlaylistResourceItemSoundbiteController } from '@api/controllers/playlist/playlistResourceItemSoundbite';

const router = Router();
router.use(`${config.api.prefix}${config.api.version}/playlist`, router);

router.get('/private/favorites', asyncHandler(PlaylistController.getAllFavoritesPrivate));
router.get('/private/followed', asyncHandler(PlaylistController.getManyFollowedPrivate));
router.get('/private', asyncHandler(PlaylistController.getManyPrivate));
router.get('/public', asyncHandler(PlaylistController.getManyPublic));
router.post('/', asyncHandler(PlaylistController.createPlaylist));
router.get('/:playlist_id_text/resources/', asyncHandler(PlaylistResourceController.getAllByPlaylistIdPublic));
router.get('/:playlist_id_text', asyncHandler(PlaylistController.getPlaylistById));
router.patch('/:playlist_id_text', asyncHandler(PlaylistController.updatePlaylist));
router.delete('/:playlist_id_text', asyncHandler(PlaylistController.deletePlaylist));

router.post('/:playlist_id_text/clip/:clip_id_text/first', asyncHandler(PlaylistResourceClipController.addClipToPlaylistFirst));
router.post('/:playlist_id_text/clip/:clip_id_text/between', asyncHandler(PlaylistResourceClipController.addClipToPlaylistBetween));
router.post('/:playlist_id_text/clip/:clip_id_text/last', asyncHandler(PlaylistResourceClipController.addClipToPlaylistLast));
router.delete('/:playlist_id_text/clip/:clip_id_text', asyncHandler(PlaylistResourceClipController.removeClipFromPlaylist));

router.post('/:playlist_id_text/item/:item_id_text/first', asyncHandler(PlaylistResourceItemController.addItemToPlaylistFirst));
router.post('/:playlist_id_text/item/:item_id_text/between', asyncHandler(PlaylistResourceItemController.addItemToPlaylistBetween));
router.post('/:playlist_id_text/item/:item_id_text/last', asyncHandler(PlaylistResourceItemController.addItemToPlaylistLast));
router.delete('/:playlist_id_text/item/:item_id_text', asyncHandler(PlaylistResourceItemController.removeItemFromPlaylist));

router.post('/:playlist_id_text/item-add-by-rss/first', asyncHandler(PlaylistResourceItemAddByRSSController.addItemAddByRSSToPlaylistFirst));
router.post('/:playlist_id_text/item-add-by-rss/between', asyncHandler(PlaylistResourceItemAddByRSSController.addItemAddByRSSToPlaylistBetween));
router.post('/:playlist_id_text/item-add-by-rss/last', asyncHandler(PlaylistResourceItemAddByRSSController.addItemAddByRSSToPlaylistLast));
router.delete('/:playlist_id_text/item-add-by-rss/:add_by_rss_hash_id', asyncHandler(PlaylistResourceItemAddByRSSController.removeItemAddByRSSFromPlaylist));

router.post('/:playlist_id_text/item-soundbite/:soundbite_id_text/first', asyncHandler(PlaylistResourceItemSoundbiteController.addItemSoundbiteToPlaylistFirst));
router.post('/:playlist_id_text/item-soundbite/:soundbite_id_text/between', asyncHandler(PlaylistResourceItemSoundbiteController.addItemSoundbiteToPlaylistBetween));
router.post('/:playlist_id_text/item-soundbite/:soundbite_id_text/last', asyncHandler(PlaylistResourceItemSoundbiteController.addItemSoundbiteToPlaylistLast));
router.delete('/:playlist_id_text/item-soundbite/:soundbite_id_text', asyncHandler(PlaylistResourceItemSoundbiteController.removeItemSoundbiteFromPlaylist));

export const playlistRouter = router;
