import { removeDeadEpisodes } from '~/controllers/episode'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    const customLimit = (process.argv.length > 2 ? process.argv[2] : 100000) as any
    const customLimitInt = parseInt(customLimit, 10)

    const customOffset = (process.argv.length > 2 ? process.argv[3] : 0) as any
    const customOffset = parseInt(customOffset, 10)

    if (!customLimitInt) {
      console.log('customLimit parameter must be an integer.')
      return
    }

    if (!customOffset) {
      console.log('customOffset parameter must be an integer.')
      return
    }
    await connectToDb()
    await removeDeadEpisodes(customLimitInt,customOffset)
  } catch (error) {
    console.log(error)
  }
  return
})()
