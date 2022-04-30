import { getRepository } from 'typeorm'
import { LiveItem } from '~/entities'

const getLiveItems = async (podcastId: string) => {
  const repository = getRepository(LiveItem)

  const liveItems = await repository
    .createQueryBuilder('liveItem')
    .select('liveItem.id')
    .addSelect('liveItem.end')
    .addSelect('liveItem.start')
    .addSelect('liveItem.status')
    .innerJoinAndSelect('liveItem.episode', 'episode')
    .where(`episode.podcastId = :podcastId`, { podcastId })
    .limit(100)
    .getMany()

  return liveItems
}

/*
  This function is used in the parser to ensure that we only ever
  save or update only one liveItem for each mediaUrl per podcast.
  We have to specify the podcastId since different podcasts
  could potentially share the same streaming URL at different times.
*/
const getLiveItemByMediaUrl = async (mediaUrl: string, podcastId: string) => {
  const repository = getRepository(LiveItem)

  const liveItem = await repository
    .createQueryBuilder('liveItem')
    .select('liveItem.id')
    .addSelect('liveItem.end')
    .addSelect('liveItem.start')
    .addSelect('liveItem.status')
    .innerJoinAndSelect('liveItem.episode', 'episode')
    .where(`episode.podcastId = :podcastId`, { podcastId })
    .andWhere(`episode.mediaUrl = :mediaUrl`, { mediaUrl })
    .getOne()

  return liveItem
}

export { getLiveItemByMediaUrl, getLiveItems }
