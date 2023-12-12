import { addFeedUrls } from 'podverse-orm'
import { connectToDb } from '~/lib/db'
import { handlePodcastFeedLastParseFailed, parseFeedUrl } from '~/services/parser'
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
    const newFeedUrls = await addFeedUrls(feedUrls)

    console.log('newFeedUrls length', newFeedUrls.length)

    for (const feedUrl of newFeedUrls) {
      try {
        const forceReparsing = true
        const cacheBust = false
        await parseFeedUrl(feedUrl, forceReparsing, cacheBust)
      } catch (error) {
        await handlePodcastFeedLastParseFailed(feedUrl, error)
      }
    }

    return
  } catch (error) {
    console.log(error)
  }
})()
