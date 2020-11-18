import { addNonPodcastIndexFeedUrlsToPriorityQueue } from '~/services/queue'

(async function () {
  try {
    await addNonPodcastIndexFeedUrlsToPriorityQueue()
  } catch (error) {
    console.log(error)
  }
})()
