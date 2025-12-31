import { PodcastBatchByFeedGuidResponse, EpisodeByGuidResponse, DTOChannel,
  DTOItem, RemoteItemGeneric } from 'podverse-helpers';
import { podcastIndexService } from '@api/factories/podcastIndexService';

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
      const piResponse = await podcastIndexService.podcastsBatchByFeedGuid(feedGuids);
      channelsUnaddedFromPI = (piResponse && Array.isArray(piResponse.feeds)) ? piResponse.feeds : [];
    }
  } catch {
    channelsUnaddedFromPI = [];
  }

  let itemsUnaddedFromPI: EpisodeByGuidResponse['episode'][] = [];
  try {
    itemsUnaddedFromPI = [];
    const items = originalItemsUnadded || [];

    const itemsWithFeedGuid = items.filter((it) => it && it.feed_guid);

    for (const it of itemsWithFeedGuid) {
      try {
        if (!it.item_guid) continue;
        const episode = await podcastIndexService.episodeGetByGuid(it.item_guid, { podcastguid: it.feed_guid });
        if (episode?.episode) itemsUnaddedFromPI.push(episode.episode);
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
