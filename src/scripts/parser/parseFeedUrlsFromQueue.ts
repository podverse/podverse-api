import { connectToDb } from '~/lib/db'
import { parseFeedUrlsFromQueue } from '~/services/parser'

(async function () {
  try {
    const priority = process.argv[2]

    if (!priority) {
      console.log('You must provide a priority queue number (1-5) as a parameter.')
      return
    }

    await connectToDb()
    await parseFeedUrlsFromQueue(parseInt(priority, 10))
  } catch (error) {
    console.log(error)
  }
})()
