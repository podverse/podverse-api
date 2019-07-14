import { addAllOrphanFeedUrlsToQueue } from '~/services/queue'

(async function () {
  try {
    await addAllOrphanFeedUrlsToQueue()
  } catch (error) {
    console.log(error)
  }
})()
