import { getConnection } from 'typeorm'
import { connectToDb } from '~/lib/db'
import { lastHour, offsetDate } from '~/lib/utility'
import { queryGoogleAnalyticsData } from './google'

enum PagePaths {
  clips = '~/clip',
  episodes = '~/episode',
  podcasts = '~/podcast'
}

enum StartDateOffset {
  hour = -60,
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
  hour = 'pastHourTotalUniquePageviews',
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
    console.log('Valid options are: hour, day, week, month, year, allTime')
    return
  }

  const startDate = timeRange === 'allTime' ? '2017-01-01' : offsetDate(startDateOffset)
  const hourFilter = TimeRanges[timeRange] === TimeRanges.hour ? `ga:hour==${lastHour()};` : ''
  const filtersExpression = `ga:pagePath=${PagePaths[pagePath]};${hourFilter}ga:uniquePageviews>0`

  const queryObj = {
    dimensions: [
      {
        name: 'ga:pagePath'
      }
    ],
    endDate: offsetDate(),
    filtersExpression,
    metrics: [
      {
        expression: 'ga:uniquePageviews'
      }
    ],
    orderBys: [
      {
        'sortOrder': 'DESCENDING',
        'fieldName': 'ga:uniquePageviews'
      }
    ],
    startDate: startDate
  }

  const response = await queryGoogleAnalyticsData(queryObj)
  await savePageviewsToDatabase(pagePath, timeRange, response)
}

const savePageviewsToDatabase = async (pagePath, timeRange, response) => {
  await connectToDb()

  const reports = response.data.reports

  for (const report of reports) {
    const data = report.data
    const rawSQLUpdates = [] as string[]

    if (data) {
      const rows = data.rows || []

      let rawSQLUpdate = ''
      let loopCount = 0
      for (const row of rows) {
        loopCount++
        const pathName = row.dimensions[0]

        // remove all characters in the url path before the id, then put in an array
        const idStartIndex = pathName.indexOf(`${pagePath}/`) + (pagePath.length + 2)
        const id = pathName.substr(idStartIndex)

        // max length of ids = 14
        if (id.length > 14) {
          continue
        }

        const values = row.metrics[0].values[0]
        const tableName = TableNames[pagePath]
        
        if (loopCount >= 50) {
          rawSQLUpdates.push(rawSQLUpdate)
          rawSQLUpdate = ''
          loopCount = 0
        }

        if (id) {
          rawSQLUpdate += `UPDATE "${tableName}s" SET "${TimeRanges[timeRange]}"=${values} WHERE id='${id}';`
        }
      }

      for (const rawSQLUpdate of rawSQLUpdates) {
        await getConnection()
          .createEntityManager()
          .query(rawSQLUpdate)
      }
    }
  }
}
