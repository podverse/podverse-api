import { faker } from '@faker-js/faker'
import { Episode, getRepository, MediaRef, Podcast } from 'podverse-orm'
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
    pastHourTotalUniquePageviews: statsQAGetNumber(),
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

  const newPodcasts: any[] = []
  for (const podcast of podcasts) {
    const newPodcast = {
      ...podcast,
      ...statsQAGetPageviews()
    }
    newPodcasts.push(newPodcast)
  }

  await podcastRepository.save(newPodcasts)

  logPerformance('statsQAUpdatePodcasts', _logEnd)
}

const statsQAUpdateEpisodes = async () => {
  logPerformance('statsQAUpdateEpisodes', _logStart)

  const episodeRepository = getRepository(Episode)
  const episodes = await episodeRepository.find({ take: 1000 })

  const newEpisodes: any[] = []
  for (const episode of episodes) {
    const newEpisode = {
      ...episode,
      ...statsQAGetPageviews()
    }
    newEpisodes.push(newEpisode)
  }

  await episodeRepository.save(newEpisodes)

  logPerformance('statsQAUpdateEpisodes', _logEnd)
}

const statsQAUpdateMediaRefs = async () => {
  logPerformance('statsQAUpdateMediaRefs', _logStart)

  const mediaRefRepository = getRepository(MediaRef)
  const mediaRefs = await mediaRefRepository.find({ take: 1000 })

  const newMediaRefs: any[] = []
  for (const mediaRef of mediaRefs) {
    const newMediaRef = {
      ...mediaRef,
      ...statsQAGetPageviews()
    }
    newMediaRefs.push(newMediaRef)
  }

  await mediaRefRepository.save(newMediaRefs)

  logPerformance('statsQAUpdateMediaRefs', _logEnd)
}
