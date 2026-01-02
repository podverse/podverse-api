import { PodcastBatchByFeedGuidResponse, EpisodeByGuidResponse, DTOChannel,
  DTOItem, RemoteItemGeneric } from 'podverse-helpers';
import { podcastIndexService } from '@api/factories/podcastIndexService';
import { cacheGetJson, cacheSetJson } from '@api/lib/keyvaldb/keyvaldb';
import { config } from '@api/config';

export type FinalRemoteItemsResult = {
	channelsAdded: DTOChannel[];
	channelsUnadded: PodcastBatchByFeedGuidResponse['feeds'];
	itemsAdded: DTOItem[];
	itemsUnadded: EpisodeByGuidResponse['episode'][];
};

export async function buildRemoteItemsFinalResult(
  originalChannelsAdded: DTOChannel[],
  originalChannelsUnadded: RemoteItemGeneric[],
  originalItemsAdded: DTOItem[],
  originalItemsUnadded: RemoteItemGeneric[]
): Promise<FinalRemoteItemsResult> {
  const feedGuids: string[] = [];
  if (originalChannelsUnadded && Array.isArray(originalChannelsUnadded)) {
    for (const r of originalChannelsUnadded) {
      if (r.feed_guid) feedGuids.push(r.feed_guid);
    }
  }

  let channelsUnaddedFromPI: PodcastBatchByFeedGuidResponse['feeds'] = [];
  try {
    if (feedGuids.length) {
      const cachedFeeds: PodcastBatchByFeedGuidResponse['feeds'] = [];
      const missingGuids: string[] = [];

      for (const guid of feedGuids) {
        const key = `pi:feed:${guid}`;
        const cached = await cacheGetJson<PodcastBatchByFeedGuidResponse['feeds'][number]>(key);
        if (cached) {
          cachedFeeds.push(cached);
        } else {
          missingGuids.push(guid);
        }
      }

      let fetchedFeeds: PodcastBatchByFeedGuidResponse['feeds'] = [];
      if (missingGuids.length) {
        const piResponse = await podcastIndexService.podcastsBatchByFeedGuid(missingGuids);
        fetchedFeeds = (piResponse && Array.isArray(piResponse.feeds)) ? piResponse.feeds : [];

        for (const f of fetchedFeeds) {
          try {
            const feedGuid = f.podcastGuid ? f.podcastGuid : null;
            if (feedGuid) {
              const key = `pi:feed:${feedGuid}`;
              await cacheSetJson<PodcastBatchByFeedGuidResponse['feeds'][number]>(key, f, config.keyvaldb.cacheTTLSeconds);
            }
          } catch {
            // swallow
          }
        }
      }

      const merged: PodcastBatchByFeedGuidResponse['feeds'] = [];
      const byGuid = new Map<string, PodcastBatchByFeedGuidResponse['feeds'][number]>();
      for (const f of [...cachedFeeds, ...fetchedFeeds]) {
        const feedGuid = f.podcastGuid ? f.podcastGuid : null;
        if (feedGuid) byGuid.set(feedGuid, f);
      }
      for (const guid of feedGuids) {
        const f = byGuid.get(guid);
        if (f) merged.push(f);
      }

      channelsUnaddedFromPI = merged;
    }
  } catch {
    channelsUnaddedFromPI = [];
  }

  let itemsUnaddedFromPI: NonNullable<EpisodeByGuidResponse['episode']>[] = [];
  try {
    itemsUnaddedFromPI = [];
    const items = originalItemsUnadded || [];

    const itemsWithFeedGuid = items.filter((it) => it && it.feed_guid && it.item_guid);

    const missingItems: { item_guid: string; feed_guid: string }[] = [];

    for (const it of itemsWithFeedGuid) {
      const key = `pi:episode:${it.item_guid}:${it.feed_guid}`;
      const cached = await cacheGetJson<EpisodeByGuidResponse['episode']>(key);
      if (cached) {
        itemsUnaddedFromPI.push(cached);
      } else {
        missingItems.push({ item_guid: String(it.item_guid), feed_guid: String(it.feed_guid) });
      }
    }

    for (const mi of missingItems) {
      try {
        const response = await podcastIndexService.episodeGetByGuid(mi.item_guid, { podcastguid: mi.feed_guid });
        if (response?.episode) {
          itemsUnaddedFromPI.push(response.episode);
          const key = `pi:episode:${mi.item_guid}:${mi.feed_guid}`;
          await cacheSetJson<NonNullable<EpisodeByGuidResponse['episode']>>(key, response.episode, config.keyvaldb.cacheTTLSeconds);
        }
      } catch {
        // swallow
      }
    }
  } catch {
    itemsUnaddedFromPI = [];
  }

  return {
    channelsAdded: originalChannelsAdded,
    channelsUnadded: channelsUnaddedFromPI,
    itemsAdded: originalItemsAdded,
    itemsUnadded: itemsUnaddedFromPI
  };
}
