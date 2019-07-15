import { queryUniquePageviews } from '~/services/stats'

(async function () {
  try {
    const pagePath = process.argv.length > 2 ? process.argv[2] : ''
    const timeRange = process.argv.length > 3 ? process.argv[3] : ''
    queryUniquePageviews(pagePath, timeRange)
  } catch (error) {
    console.log(error)
  }
})()
