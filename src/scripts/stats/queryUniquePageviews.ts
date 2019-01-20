import { queryUniquePageviews } from 'services/stats'

const pagePath = process.env.STATS_PAGE_TYPE
const timeRange = process.env.STATS_TIME_RANGE

queryUniquePageviews(pagePath, timeRange)
