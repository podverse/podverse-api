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
    .addSelect('liveItem.chatIRCURL')
    .innerJoinAndSelect('liveItem.episode', 'episode')
    .where(`episode.podcastId = :podcastId`, { podcastId })
    .andWhere(`episode.isPublic = true`)
    .limit(100)
    .getMany()

  return liveItems
}

/*
  This function is used in the parser to ensure that we only ever
  save or update only one liveItem for each guid per podcast.
  We have to specify the podcastId since different podcasts
  could potentially share the same guid.
*/
const getLiveItemByGuid = async (guid: string, podcastId: string) => {
  const repository = getRepository(LiveItem)

  const liveItem = await repository
    .createQueryBuilder('liveItem')
    .select('liveItem.id')
    .addSelect('liveItem.end')
    .addSelect('liveItem.start')
    .addSelect('liveItem.status')
    .addSelect('liveItem.chatIRCURL')
    .innerJoinAndSelect('liveItem.episode', 'episode')
    .where(`episode.podcastId = :podcastId`, { podcastId })
    .andWhere(`episode.guid = :guid`, { guid })
    .getOne()

  return liveItem
}

export { getLiveItemByGuid, getLiveItems }
