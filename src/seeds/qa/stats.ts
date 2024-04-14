import { faker } from '@faker-js/faker'
import { getRepository } from 'typeorm'
import { Episode, MediaRef, Podcast, StatsEpisode, StatsMediaRef, StatsPodcast } from '~/entities'
import { logPerformance, _logEnd, _logStart } from '~/lib/utility'

const statsQAMinRange = 0
const statsQAMaxRange = 100

export const statsQAUpdatePageviews = async () => {
  logPerformance('statsQAUpdatePageviews', _logStart)

  await statsQAUpdatePodcasts()
  await statsQAUpdateEpisodes()
  await statsQAUpdateMediaRefs()

  logPerformance('statsQAUpdatePageviews', _logEnd)
}

const statsQAGetNumber = () => {
  return faker.datatype.number({
    min: statsQAMinRange,
    max: statsQAMaxRange
  })
}

const statsQAGetPageviews = () => {
  return {
    pastDayTotalUniquePageviews: statsQAGetNumber(),
    pastWeekTotalUniquePageviews: statsQAGetNumber(),
    pastMonthTotalUniquePageviews: statsQAGetNumber(),
    pastYearTotalUniquePageviews: statsQAGetNumber(),
    pastAllTimeTotalUniquePageviews: statsQAGetNumber()
  }
}

const statsQAUpdatePodcasts = async () => {
  logPerformance('statsQAUpdatePodcasts', _logStart)

  const podcastRepository = getRepository(Podcast)
  const podcasts = await podcastRepository.find({ take: 1000 })

  const statsPodcastsRepository = getRepository(StatsPodcast)
  for (const podcast of podcasts) {
    const statsPodcast = await statsPodcastsRepository.find({ podcast })
    const newStatsPodcast = {
      ...(statsPodcast?.[0] ? statsPodcast[0] : { podcast }),
      ...statsQAGetPageviews()
    }
    await statsPodcastsRepository.save(newStatsPodcast)
  }

  logPerformance('statsQAUpdatePodcasts', _logEnd)
}

const statsQAUpdateEpisodes = async () => {
  logPerformance('statsQAUpdateEpisodes', _logStart)

  const episodeRepository = getRepository(Episode)
  const episodes = await episodeRepository.find({ take: 1000 })

  const statsEpisodesRepository = getRepository(StatsEpisode)
  for (const episode of episodes) {
    const statsEpisode = await statsEpisodesRepository.find({ episode })
    const newStatsEpisode = {
      ...(statsEpisode?.[0] ? statsEpisode[0] : { episode }),
      ...statsQAGetPageviews()
    }
    await statsEpisodesRepository.save(newStatsEpisode)
  }

  logPerformance('statsQAUpdateEpisodes', _logEnd)
}

const statsQAUpdateMediaRefs = async () => {
  logPerformance('statsQAUpdateMediaRefs', _logStart)

  const mediaRefRepository = getRepository(MediaRef)
  const mediaRefs = await mediaRefRepository.find({ take: 1000 })

  const statsMediaRefsRepository = getRepository(StatsMediaRef)
  for (const mediaRef of mediaRefs) {
    const statsMediaRef = await statsMediaRefsRepository.find({ mediaRef })
    const newStatsMediaRef = {
      ...(statsMediaRef?.[0] ? statsMediaRef[0] : { mediaRef }),
      ...statsQAGetPageviews()
    }
    await statsMediaRefsRepository.save(newStatsMediaRef)
  }

  logPerformance('statsQAUpdateMediaRefs', _logEnd)
}
