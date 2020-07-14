import { addExistingFeedUrlsByIdToQueue } from '~/services/queue'

(async function () {
  let feedUrls = []

  try {
    if (process.argv.length > 2) {
      let delimitedFeedUrls = process.argv[2]
      delimitedFeedUrls = delimitedFeedUrls.replace(/ |'|"|`/g, '')
      feedUrls = delimitedFeedUrls.split(',') as never || []
    } else {
      console.log('You must provide a list of feedUrl ids as a comma-delimited npm argument.')
      return
    }

    await addExistingFeedUrlsByIdToQueue(feedUrls)
  } catch (error) {
    console.log(error)
  }
})()
