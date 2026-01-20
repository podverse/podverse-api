import { QueryParamsMedium, QueryParamsQueueMedium } from "podverse-helpers";
import { AccountFollowingChannelService, AccountFollowingPlaylistService, AccountFollowingAccountService } from "podverse-orm";

export async function getFollowedChannelIds(account_id: number, mediumType: QueryParamsMedium | null): Promise<number[]> {
  const accountFollowingChannelService = new AccountFollowingChannelService();
  const { results } = await accountFollowingChannelService.getFollowedChannelsWithCount(Number(account_id), mediumType);
  return results.map((f: { channel_id: number }) => f.channel_id);
}

export async function getFollowedPlaylistIdsPrivate(
  account_id: number,
  queueMediumType: QueryParamsQueueMedium | null
): Promise<number[]> {
  const accountFollowingPlaylistService = new AccountFollowingPlaylistService();
  const results = await accountFollowingPlaylistService.getFollowedPlaylistsPrivateWithCount(Number(account_id), queueMediumType);
  const data = results[0];
  return data.map((f: { playlist_id: number }) => f.playlist_id);
}

export async function getFollowedAccountIds(account_id: number): Promise<number[]> {
  const accountFollowingAccountService = new AccountFollowingAccountService();
  const followedAccounts = await accountFollowingAccountService.getFollowedAccountsPrivate(Number(account_id), {
    relations: ['following_account']
  });
  return followedAccounts
    .map(fa => fa.following_account?.id)
    .filter((id): id is number => id !== undefined);
}
