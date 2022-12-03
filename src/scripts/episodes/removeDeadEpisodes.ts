import { removeDeadEpisodes } from '~/controllers/episode'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    const customLimit = (process.argv.length > 2 ? process.argv[2] : 100000) as any
    const customLimitInt = parseInt(customLimit, 10)

    if (!customLimitInt) {
      console.log('customLimit parameter must be an integer.')
      return
    }

    await connectToDb()
    await removeDeadEpisodes(customLimitInt)
  } catch (error) {
    console.log(error)
  }
  return
})()
