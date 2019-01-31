import { connectToDb } from '~/lib/db'
import { parseAllFeedUrlsFromQueue } from '~/services/parser'

(async function () {
  try {
    const priority = process.argv[2]
    await connectToDb()
    await parseAllFeedUrlsFromQueue(parseInt(priority, 10))
  } catch (error) {
    console.log(error)
  }
})()
