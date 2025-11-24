import { AccountFollowingChannelService, AccountFollowingPlaylistService } from "podverse-orm";

export async function getFollowedChannelIds(account_id: number, medium_id: number | null): Promise<number[]> {
  const accountFollowingChannelService = new AccountFollowingChannelService();
  const { results } = await accountFollowingChannelService.getFollowedChannelsWithCount(Number(account_id), medium_id);
  return results.map((f: { channel_id: number }) => f.channel_id);
}

export async function getFollowedPlaylistIdsPrivate(
  account_id: number,
  medium_id: number | null
): Promise<number[]> {
  const accountFollowingPlaylistService = new AccountFollowingPlaylistService();
  const results = await accountFollowingPlaylistService.getFollowedPlaylistsPrivateWithCount(Number(account_id), medium_id);
  const data = results[0];
  return data.map((f: { playlist_id: number }) => f.playlist_id);
}
