import { AccountFollowingChannelService } from "podverse-orm";

export async function getFollowedChannelIds(account_id: number): Promise<number[]> {
  const accountFollowingChannelService = new AccountFollowingChannelService();
  const { results } = await accountFollowingChannelService.getFollowedChannelsWithCount(Number(account_id));
  return results.map((f: { channel_id: number }) => f.channel_id);
}