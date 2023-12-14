import { Episode, getRepository } from 'podverse-orm'

export const getRandomEpisodeIds = async () => {
  const episodeRepository = getRepository(Episode)
  const episodes = await episodeRepository
    .createQueryBuilder('episode')
    .select('episode.id')
    .where('episode."isPublic" = TRUE')
    .orderBy('RANDOM()')
    .limit(100)
    .getMany()

  return episodes.map((episode) => episode.id)
}
