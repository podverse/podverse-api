import { createFeedUrls } from '~/controllers/feedUrl'
import { connectToDb } from '~/lib/db'

(async function () {
  try {
    await connectToDb()

    let delimitedFeedUrls = process.argv[2]
    if (!delimitedFeedUrls) {
      console.log('Error: Provide a list of feedUrls as an argument.')
    }

    delimitedFeedUrls = delimitedFeedUrls.replace(/ |'|"|`/g, '')

    const feedUrls = delimitedFeedUrls.split(',') as never || []

    await createFeedUrls(feedUrls)

    return
  } catch (error) {
    console.log(error)
  }
})()
