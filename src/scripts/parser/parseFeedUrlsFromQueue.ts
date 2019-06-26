import { connectToDb } from '~/lib/db'
import { parseFeedUrlsFromQueue } from '~/services/parser'

(async function () {
  try {
    const priority = process.argv[2]
    const restartTimeOut = process.argv.length > 3 ? process.argv[3] : 10000000

    if (!priority) {
      console.log('You must provide a priority queue number (1-5) as a parameter.')
      return
    }

    await connectToDb()
    await parseFeedUrlsFromQueue(priority, restartTimeOut)
  } catch (error) {
    console.log(error)
  }
})()
