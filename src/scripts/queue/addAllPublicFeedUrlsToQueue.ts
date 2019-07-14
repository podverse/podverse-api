import { addAllPublicFeedUrlsToQueue } from '~/services/queue'

(async function () {
  try {
    await addAllPublicFeedUrlsToQueue()
  } catch (error) {
    console.log(error)
  }
})()
