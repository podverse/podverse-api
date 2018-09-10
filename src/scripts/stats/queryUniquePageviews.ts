import { queryUniquePageviews } from 'services/stats'

const pagePath = process.env.STATS_PAGE_PATH
const startIndexOffset = parseInt(process.env.STATS_START_INDEX_OFFSET, 10) || 0
const timeRange = process.env.STATS_TIME_RANGE

queryUniquePageviews(pagePath, timeRange, startIndexOffset)
