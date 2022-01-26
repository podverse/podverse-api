import { connectToDb } from '~/lib/db'
import { parsePublicFeedUrls } from '~/services/parser'
;(async function () {
  try {
    await connectToDb()
    await parsePublicFeedUrls()
  } catch (error) {
    console.log(error)
  }
})()
