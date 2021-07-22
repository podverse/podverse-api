/* eslint-disable @typescript-eslint/camelcase */
import { getConnection } from 'typeorm'
import { connectToDb } from '~/lib/db'
import { /* lastHour,*/ offsetDate } from '~/lib/utility'
import { queryMatomoData } from './matomo'

enum PagePaths {
  clips = 'clip',
  episodes = 'episode',
  podcasts = 'podcast'
}

enum StartDateOffset {
  // hour = -60,
  day = -1440,
  week = -10080,
  month = -43800,
  year = -525600
}

const TableNames = {
  clips: 'mediaRef',
  episodes: 'episode',
  podcasts: 'podcast'
}

enum TimeRanges {
  // hour = 'pastHourTotalUniquePageviews',
  day = 'pastDayTotalUniquePageviews',
  week = 'pastWeekTotalUniquePageviews',
  month = 'pastMonthTotalUniquePageviews',
  year = 'pastYearTotalUniquePageviews',
  allTime = 'pastAllTimeTotalUniquePageviews'
}

export const queryUniquePageviews = async (pagePath, timeRange) => {
  const startDateOffset = parseInt(StartDateOffset[timeRange], 10)

  if (!Object.keys(PagePaths).includes(pagePath)) {
    console.log('A valid pagePath must be provided in the first parameter.')
    console.log('Valid options are: podcasts, episodes, clips')
    return
  }

  if (!Object.keys(TimeRanges).includes(timeRange)) {
    console.log('A valid timeRange must be provided in the second parameter.')
    console.log('Valid options are: day, week, month, year, allTime')
    return
  }

  const startDate = timeRange === 'allTime' ? '2017-01-01' : offsetDate(startDateOffset)
  const endDate = offsetDate()

  const response = await queryMatomoData(startDate, endDate, PagePaths[pagePath])
  await savePageviewsToDatabase(pagePath, timeRange, response)
}

const savePageviewsToDatabase = async (pagePath, timeRange, response) => {
  await connectToDb()

  const rows = response.data
  const tableName = TableNames[pagePath]
  console.log('savePageviewsToDatabase')
  console.log('pagePath', pagePath)
  console.log('timeRange', timeRange)
  console.log('rows.length', rows.length)
  console.log('tableName', tableName)
  console.log('TimeRange', TimeRanges[timeRange])

  for (const row of rows) {
    const label = row.label

    // remove all characters in the url path before the id, then put in an array
    const idStartIndex = label.indexOf(`${pagePath}/`) + (pagePath.length + 2)
    const id = label.substr(idStartIndex)

    // max length of ids = 14
    if (id.length > 14) {
      console.log('id too long!', id)
      continue
    }

    const sum_daily_nb_uniq_visitors = row.sum_daily_nb_uniq_visitors

    // Updating the database one at a time to avoid deadlocks
    // TODO: optimize with bulk updates, and avoid deadlocks! 
    if (id) {
      const rawSQLUpdate = `UPDATE "${tableName}s" SET "${TimeRanges[timeRange]}"=${sum_daily_nb_uniq_visitors} WHERE id='${id}';`
      await getConnection()
        .createEntityManager()
        .query(rawSQLUpdate)
    }
  }
}
