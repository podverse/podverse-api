import { connectToDb } from '~/lib/db'
import { parseOrphanFeedUrlsLocally } from '~/services/parser'

(async function () {
  try {
    await connectToDb()
    await parseOrphanFeedUrlsLocally()
  } catch (error) {
    console.log(error)
  }
})()
