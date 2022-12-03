/* eslint-disable @typescript-eslint/camelcase */
import { getConnection } from 'typeorm'
import { connectToDb } from '~/lib/db'
import { /* lastHour,*/ offsetDate } from '~/lib/utility'
import { splitDateIntoEqualIntervals } from '~/lib/utility/date'
import { queryMatomoData } from './matomo'
const moment = require('moment')

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

  const startDate = new Date(timeRange === 'allTime' ? '2017-01-01' : offsetDate(startDateOffset))
  const endDate = new Date(offsetDate())

  const numberOfIntervals = ['year', 'allTime'].includes(timeRange) ? 12 : 1
  const dateIntervals = splitDateIntoEqualIntervals(startDate, endDate, numberOfIntervals)
  let data: any[] = []

  for (const dateInterval of dateIntervals) {
    const response: any = await queryMatomoData(
      moment(dateInterval.start).format('YYYY-MM-DD'),
      moment(dateInterval.end).format('YYYY-MM-DD'),
      PagePaths[pagePath]
    )
    data = data.concat(response.data)
  }

  await savePageviewsToDatabase(pagePath, timeRange, data)
}

const savePageviewsToDatabase = async (pagePath, timeRange, data) => {
  await connectToDb()

  const matomoDataRows = data
  const tableName = TableNames[pagePath]
  console.log('savePageviewsToDatabase')
  console.log('pagePath', pagePath)
  console.log('timeRange', timeRange)
  console.log('matomoDataRows.length', matomoDataRows.length)
  console.log('tableName', tableName)
  console.log('TimeRange', TimeRanges[timeRange])

  /*
    The Matomo stats endpoint will only return data for pages that have a view in the past X days,
    so we need to first set all of the table rows with values > 0 back to 0,
    before writing the Matomo data to the table.
  */

  const getTableRowsWithStatsData = `SELECT id, "${TimeRanges[timeRange]}" FROM "${tableName}s" WHERE "${TimeRanges[timeRange]}">0;`
  const tableRowsWithStatsData = await getConnection().createEntityManager().query(getTableRowsWithStatsData)
  console.log('tableRowsWithStatsData length', tableRowsWithStatsData.length)

  for (const row of tableRowsWithStatsData) {
    try {
      // Updating the database one at a time to avoid deadlocks
      // TODO: optimize with bulk updates, and avoid deadlocks!
      const rawSQLUpdate = `UPDATE "${tableName}s" SET "${TimeRanges[timeRange]}"=0 WHERE id='${row.id}';`
      await getConnection().createEntityManager().query(rawSQLUpdate)
    } catch (err) {
      console.log('tableRowsWithStatsData err', err)
      console.log('tableRowsWithStatsData err row', row)
    }
  }

  for (const row of matomoDataRows) {
    try {
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
        await getConnection().createEntityManager().query(rawSQLUpdate)
      }
    } catch (err) {
      console.log('row err', err)
      console.log('row', row)
    }
  }
}
