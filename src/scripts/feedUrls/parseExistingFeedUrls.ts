import { getFeedUrls } from '~/controllers/feedUrl'
import { connectToDb } from '~/lib/db'
import { handlePodcastFeedLastParseFailed, parseFeedUrl } from '~/services/parser'

(async function () {
  let feedUrls = []

  if (process.argv.length > 2) {
    let delimitedFeedUrls = process.argv[2]
    delimitedFeedUrls = delimitedFeedUrls.replace(/ |'|"|`/g, '')
    feedUrls = delimitedFeedUrls.split(',') as never || []
  } else {
    console.log('You must provide a list of feedUrls as a comma-delimited npm argument.')
    return
  }

  try {
    await connectToDb()
    const existingFeedUrls = await getFeedUrls({ url: feedUrls })

    console.log('existingFeedUrls length', existingFeedUrls.length)

    for (const feedUrl of existingFeedUrls) {
      try {
        const forceReparsing = true
        await parseFeedUrl(feedUrl, forceReparsing)
      } catch (error) {
        await handlePodcastFeedLastParseFailed(feedUrl, error)
      }
    }

    return
  } catch (error) {
    console.log(error)
  }
})()
