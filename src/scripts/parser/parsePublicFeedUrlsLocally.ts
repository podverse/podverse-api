import { connectToDb } from '~/lib/db'
import { parsePublicFeedUrlsLocally } from '~/services/parser'

(async function () {
  try {
    await connectToDb()
    await parsePublicFeedUrlsLocally()
  } catch (error) {
    console.log(error)
  }
})()
