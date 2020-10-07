import { addNonAuthorityFeedUrlsToQueue } from '~/services/queue'

(async function () {
  try {
    await addNonAuthorityFeedUrlsToQueue()
  } catch (error) {
    console.log(error)
  }
})()
