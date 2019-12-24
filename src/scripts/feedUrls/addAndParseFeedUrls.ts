import { addFeedUrls } from '~/controllers/feedUrl'
import { connectToDb } from '~/lib/db'
import { parseFeedUrl } from '~/services/parser'

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
    const newFeedUrls = await addFeedUrls(feedUrls)

    console.log('newFeedUrls length', newFeedUrls.length)

    for (const feedUrl of newFeedUrls) {
      console.log('now parsing feedUrl:', feedUrl.url)
      console.log('now parsing podcast:', feedUrl && feedUrl.podcast ? feedUrl.podcast.title : '(new podcast)')
      await parseFeedUrl(feedUrl)
    }

    console.log('finished parsing feed urls')

    return
  } catch (error) {
    console.log(error)
  }
})()
