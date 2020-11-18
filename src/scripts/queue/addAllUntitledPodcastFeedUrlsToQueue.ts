import { addAllUntitledPodcastFeedUrlsToQueue } from '~/services/queue'

(async function () {
  try {
    await addAllUntitledPodcastFeedUrlsToQueue()
  } catch (error) {
    console.log(error)
  }
})()
