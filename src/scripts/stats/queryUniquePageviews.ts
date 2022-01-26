import { queryUniquePageviews } from '~/services/stats'
;(async function () {
  try {
    const pagePath = process.argv[2]
    const timeRange = process.argv[3]
    queryUniquePageviews(pagePath, timeRange)
  } catch (error) {
    console.log(error)
  }
})()
