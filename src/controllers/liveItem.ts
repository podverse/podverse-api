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

export { getLiveItems }
