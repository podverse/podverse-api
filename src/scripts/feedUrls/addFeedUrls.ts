import { addFeedUrls } from '~/controllers/feedUrl'
import { connectToDb } from '~/lib/db'
;(async function () {
  let feedUrls = []

  if (process.argv.length > 2) {
    let delimitedFeedUrls = process.argv[2]
    delimitedFeedUrls = delimitedFeedUrls.replace(/ |'|"|`/g, '')
    feedUrls = (delimitedFeedUrls.split(',') as never) || []
  } else {
    console.log('You must provide a list of feedUrls as a comma-delimited npm argument.')
    return
  }

  try {
    await connectToDb()
    await addFeedUrls(feedUrls)

    return
  } catch (error) {
    console.log(error)
  }
})()
