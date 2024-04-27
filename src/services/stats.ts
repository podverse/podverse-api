/* eslint-disable @typescript-eslint/camelcase */
import { getConnection } from 'typeorm'
import { connectToDb } from '~/lib/db'
import { _logEnd, _logStart, logPerformance, offsetDate } from '~/lib/utility'
import { splitDateIntoEqualIntervals } from '~/lib/utility/date'
import { queryMatomoData } from './matomo'
const moment = require('moment')

enum PagePaths {
  clips = 'clip',
  episodes = 'episode',
  podcasts = 'podcast',
  albums = 'album',
  tracks = 'track',
  channels = 'channel',
  videos = 'video'
}

enum StartDateOffset {
  // hour = -60,
  day = -1440,
  week = -10080,
  month = -43800,
  year = -525600
}

/*
  const TableNames = {
    clip: 'mediaRef',
    episode: 'episode',
    podcast: 'podcast',
    album: 'podcast',
    track: 'episode',
    channel: 'podcast',
    video: 'episode'
  }
*/

enum QueryTimeFrame {
  day = 'daily',
  week = 'weekly',
  month = 'monthly',
  year = 'yearly',
  allTime = 'all_time'
}

enum QueryIntervals {
  day = 1,
  week = 4,
  month = 10,
  year = 100,
  allTime = 200
}

export const queryUniquePageviews = async (pagePath: string, timeRange) => {
  logPerformance('queryUniquePageviews', _logStart)
  /* This start time is later used to determine which rows can be reset to 0. */
  const jobStartTimeISO = new Date().toISOString()
  console.log('jobStartTimeISO:', jobStartTimeISO)

  const finalPagePath = PagePaths[pagePath]
  const startDateOffset = parseInt(StartDateOffset[timeRange], 10)

  if (!Object.keys(PagePaths).includes(pagePath)) {
    console.log('A valid pagePath must be provided in the first parameter.')
    console.log('Valid options are: podcasts, episodes, clips, albums, tracks, channels, videos')
    return
  }

  if (!Object.keys(QueryTimeFrame).includes(timeRange)) {
    console.log('A valid timeRange must be provided in the second parameter.')
    console.log('Valid options are: day, week, month, year, allTime')
    return
  }

  const startDate = new Date(timeRange === 'allTime' ? '2017-01-01' : offsetDate(startDateOffset))
  const endDate = new Date(offsetDate())

  const numberOfIntervals = parseInt(QueryIntervals[timeRange], 10)
  const dateIntervals = splitDateIntoEqualIntervals(startDate, endDate, numberOfIntervals)
  let data: any[] = []

  for (const dateInterval of dateIntervals) {
    logPerformance('matomo stats query', _logStart)
    console.log('query dateInterval query', dateInterval)
    const response: any = await queryMatomoData(
      moment(dateInterval.start).format('YYYY-MM-DD'),
      moment(dateInterval.end).format('YYYY-MM-DD'),
      finalPagePath
    )
    data = data.concat(response.data)
    console.log('data length:', data.length)
    logPerformance('matomo stats query', _logEnd)
  }

  /*
    Currently there are some invalid page values in our Matomo data
    that get there because of custom RSS feeds. For those pages,
    the url will look like
    https://podverse.fm/podcast/https://some.podcast.com/something/audiofile.mp3
    Since the id for podcast/episode/clip should be limited to 14 characters,
    this code is duck-typing to filter out urls that have more than
    14 characters in the path parameter.
  */

  const filterCustomFeedUrls = (data: any[], limit: number) => {
    return data.filter((x) => x.url.length <= limit && x.url?.split('/').length - 1 === 4)
  }

  const podcastLimit = 42 // https://podverse.fm/podcast/12345678901234
  const episodeLimit = 42 // https://podverse.fm/episode/12345678901234
  const clipLimit = 39 // https://podverse.fm/clip/12345678901234
  const albumLimit = 40 // https://podverse.fm/album/12345678901234
  const trackLimit = 40 // https://podverse.fm/track/12345678901234
  const channelLimit = 42 // https://podverse.fm/channel/12345678901234
  const videoLimit = 40 // https://podverse.fm/video/12345678901234

  let filteredData: any[] = []
  if (finalPagePath === PagePaths.podcasts) {
    filteredData = filterCustomFeedUrls(data, podcastLimit)
  } else if (finalPagePath === PagePaths.episodes) {
    filteredData = filterCustomFeedUrls(data, episodeLimit)
  } else if (finalPagePath === PagePaths.clips) {
    filteredData = filterCustomFeedUrls(data, clipLimit)
  } else if (finalPagePath === PagePaths.albums) {
    filteredData = filterCustomFeedUrls(data, albumLimit)
  } else if (finalPagePath === PagePaths.tracks) {
    filteredData = filterCustomFeedUrls(data, trackLimit)
  } else if (finalPagePath === PagePaths.channels) {
    filteredData = filterCustomFeedUrls(data, channelLimit)
  } else if (finalPagePath === PagePaths.videos) {
    filteredData = filterCustomFeedUrls(data, videoLimit)
  }

  await savePageviewsToDatabase(finalPagePath, timeRange, filteredData, jobStartTimeISO)
  logPerformance('queryUniquePageviews', _logEnd)
}

const generateGetOutdatedDataQueryString = (finalPagePath: string, timeRange, jobStartTimeISO) => {
  let queryString = 'pagePath: string, timeRange, tableName: string'

  if (finalPagePath === PagePaths.podcasts) {
    queryString = `
      SELECT sp.id
      FROM "podcasts" p
      LEFT JOIN
        stats_podcast sp ON p.id = sp.podcast_id
          AND sp.timeframe = '${QueryTimeFrame[timeRange]}'
      WHERE p."hasVideo" IS FALSE
        AND p.medium = 'podcast'
        AND sp."updatedAt" < '${jobStartTimeISO}'
    `
  } else if (finalPagePath === PagePaths.episodes) {
    queryString = `
      SELECT se.id
      FROM "episodes" e
      JOIN "podcasts" p ON p.id = e."podcastId"
      LEFT JOIN
        stats_episode se on e.id = se.episode_id
        AND se.timeframe = '${QueryTimeFrame[timeRange]}'
      WHERE p."hasVideo" IS FALSE
        AND p."medium" = 'podcast'
        AND se."updatedAt" < '${jobStartTimeISO}'
    `
  } else if (finalPagePath === PagePaths.clips) {
    queryString = `
      SELECT smr.id
      FROM "mediaRefs" mr
      LEFT JOIN
        stats_media_ref smr ON mr.id = smr.media_ref_id
          AND smr.timeframe = '${QueryTimeFrame[timeRange]}'
      WHERE smr."updatedAt" < '${jobStartTimeISO}'
    `
  } else if (finalPagePath === PagePaths.albums) {
    queryString = `
      SELECT sp.id
      FROM "podcasts" p
      LEFT JOIN
        stats_podcast sp ON p.id = sp.podcast_id
          AND sp.timeframe = '${QueryTimeFrame[timeRange]}'
      WHERE p."hasVideo" IS FALSE
        AND p.medium = 'music'
        AND sp."updatedAt" < '${jobStartTimeISO}'
    `
  } else if (finalPagePath === PagePaths.tracks) {
    queryString = `
      SELECT se.id
      FROM "episodes" e
      JOIN "podcasts" p ON p.id = e."podcastId"
      LEFT JOIN
        stats_episode se on e.id = se.episode_id
        AND se.timeframe = '${QueryTimeFrame[timeRange]}'
      WHERE p."hasVideo" IS FALSE
        AND p."medium" = 'music'
        AND se."updatedAt" < '${jobStartTimeISO}'
    `
  } else if (finalPagePath === PagePaths.channels) {
    queryString = `
      SELECT sp.id
      FROM "podcasts" p
      LEFT JOIN
        stats_podcast sp ON p.id = sp.podcast_id
          AND sp.timeframe = '${QueryTimeFrame[timeRange]}'
      WHERE p."hasVideo" IS TRUE
        AND sp."updatedAt" < '${jobStartTimeISO}'
    `
  } else if (finalPagePath === PagePaths.videos) {
    queryString = `
      SELECT se.id
      FROM "episodes" e
      JOIN "podcasts" p ON p.id = e."podcastId"
      LEFT JOIN
        stats_episode se on e.id = se.episode_id
        AND se.timeframe = '${QueryTimeFrame[timeRange]}'
      WHERE p."hasVideo" IS TRUE
        AND se."updatedAt" < '${jobStartTimeISO}'
    `
  } else {
    throw new Error('generateAllRelatedDataQueryString: Failed to generate queryString')
  }

  return queryString
}

const generateResetToZeroQueryString = (finalPagePath: string, timeRange, id: string) => {
  let queryString = ''

  if (finalPagePath === PagePaths.podcasts) {
    queryString = `
      UPDATE "stats_podcast"
      SET play_count=0
      WHERE id = '${id}';
    `
  } else if (finalPagePath === PagePaths.episodes) {
    queryString = `
      UPDATE "stats_episode"
      SET play_count=0
      WHERE id = '${id}';
    `
  } else if (finalPagePath === PagePaths.clips) {
    queryString = `
      UPDATE "stats_media_ref"
      SET play_count=0
      WHERE id = '${id}';
    `
  } else if (finalPagePath === PagePaths.albums) {
    queryString = `
      UPDATE "stats_podcast"
      SET play_count=0
      WHERE id = '${id}';
    `
  } else if (finalPagePath === PagePaths.tracks) {
    queryString = `
      UPDATE "stats_episode"
      SET play_count=0
      WHERE id = '${id}';
    `
  } else if (finalPagePath === PagePaths.channels) {
    queryString = `
      UPDATE "stats_podcast"
      SET play_count=0
      WHERE id = '${id}';
    `
  } else if (finalPagePath === PagePaths.videos) {
    queryString = `
      UPDATE "stats_episode"
      SET play_count=0
      WHERE id = '${id}';
    `
  } else {
    throw new Error('generateAllRelatedDataQueryString: Failed to generate queryString')
  }

  return queryString
}

const generateSetNewCountQuery = (finalPagePath: string, timeRange, id: string, sum_daily_nb_uniq_visitors = 0) => {
  let queryString = ''

  if (finalPagePath === PagePaths.podcasts) {
    queryString = `
      INSERT INTO stats_podcast (play_count, timeframe, podcast_id)
      VALUES (${sum_daily_nb_uniq_visitors}, '${QueryTimeFrame[timeRange]}', '${id}')
      ON CONFLICT (timeframe, podcast_id)
      DO UPDATE SET play_count = EXCLUDED.play_count;
    `
  } else if (finalPagePath === PagePaths.episodes) {
    queryString = `
      INSERT INTO stats_episode (play_count, timeframe, episode_id)
      VALUES (${sum_daily_nb_uniq_visitors}, '${QueryTimeFrame[timeRange]}', '${id}')
      ON CONFLICT (timeframe, episode_id)
      DO UPDATE SET play_count = EXCLUDED.play_count;
    `
  } else if (finalPagePath === PagePaths.clips) {
    queryString = `
      INSERT INTO stats_media_ref (play_count, timeframe, media_ref_id)
      VALUES (${sum_daily_nb_uniq_visitors}, '${QueryTimeFrame[timeRange]}', '${id}')
      ON CONFLICT (timeframe, media_ref_id)
      DO UPDATE SET play_count = EXCLUDED.play_count;
    `
  } else if (finalPagePath === PagePaths.albums) {
    queryString = `
      INSERT INTO stats_podcast (play_count, timeframe, podcast_id)
      VALUES (${sum_daily_nb_uniq_visitors}, '${QueryTimeFrame[timeRange]}', '${id}')
      ON CONFLICT (timeframe, podcast_id)
      DO UPDATE SET play_count = EXCLUDED.play_count;
    `
  } else if (finalPagePath === PagePaths.tracks) {
    queryString = `
      INSERT INTO stats_episode (play_count, timeframe, episode_id)
      VALUES (${sum_daily_nb_uniq_visitors}, '${QueryTimeFrame[timeRange]}', '${id}')
      ON CONFLICT (timeframe, episode_id)
      DO UPDATE SET play_count = EXCLUDED.play_count;
    `
  } else if (finalPagePath === PagePaths.channels) {
    queryString = `
      INSERT INTO stats_podcast (play_count, timeframe, podcast_id)
      VALUES (${sum_daily_nb_uniq_visitors}, '${QueryTimeFrame[timeRange]}', '${id}')
      ON CONFLICT (timeframe, podcast_id)
      DO UPDATE SET play_count = EXCLUDED.play_count;
    `
  } else if (finalPagePath === PagePaths.videos) {
    queryString = `
      INSERT INTO stats_episode (play_count, timeframe, episode_id)
      VALUES (${sum_daily_nb_uniq_visitors}, '${QueryTimeFrame[timeRange]}', '${id}')
      ON CONFLICT (timeframe, episode_id)
      DO UPDATE SET play_count = EXCLUDED.play_count;
    `
  } else {
    throw new Error('generateSetNewCountQuery: Failed to generate queryString')
  }

  return queryString
}

const savePageviewsToDatabase = async (finalPagePath: string, timeRange, data, jobStartTimeISO) => {
  await connectToDb()

  const matomoDataRows = data
  console.log('savePageviewsToDatabase')
  console.log('finalPagePath', finalPagePath)
  console.log('timeRange', timeRange)
  console.log('matomoDataRows.length', matomoDataRows.length)
  console.log('TimeRange', QueryTimeFrame[timeRange])

  for (const row of matomoDataRows) {
    try {
      const label = row.label

      // remove all characters in the url path before the id, then put in an array
      const idStartIndex = label.indexOf(`${finalPagePath}/`) + (finalPagePath.length + 1)
      const id = label.substr(idStartIndex)

      // max length of ids = 14
      if (id.length > 14) {
        console.log('id too long!', id)
        continue
      }

      const sum_daily_nb_uniq_visitors = row.sum_daily_nb_uniq_visitors

      if (id) {
        const rawSQLUpdate = generateSetNewCountQuery(finalPagePath, timeRange, id, sum_daily_nb_uniq_visitors)
        await getConnection().createEntityManager().query(rawSQLUpdate)
      }
    } catch (err) {
      console.log('row err', err)
      console.log('row', row)
    }
  }

  const getOutdatedStatsRowsQuery = generateGetOutdatedDataQueryString(finalPagePath, timeRange, jobStartTimeISO)
  const outdatedStatsRows = await getConnection().createEntityManager().query(getOutdatedStatsRowsQuery)

  for (const row of outdatedStatsRows) {
    try {
      const rawSQLUpdate = generateResetToZeroQueryString(finalPagePath, timeRange, row.id)
      await getConnection().createEntityManager().query(rawSQLUpdate)
    } catch (err) {
      console.log('outdatedStatsRows err', err)
      console.log('outdatedStatsRows err row', row)
    }
  }
}
