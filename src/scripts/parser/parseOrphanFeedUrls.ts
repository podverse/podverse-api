import { connectToDb } from '~/lib/db'
import { parseOrphanFeedUrls } from '~/services/parser'

(async function () {
  try {
    await connectToDb()
    await parseOrphanFeedUrls()
  } catch (error) {
    console.log(error)
  }
})()
