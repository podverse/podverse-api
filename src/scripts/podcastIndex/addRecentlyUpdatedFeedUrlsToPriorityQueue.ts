import { addRecentlyUpdatedFeedUrlsToPriorityQueue } from '~/services/podcastIndex'

(async function () {
  try {
    await addRecentlyUpdatedFeedUrlsToPriorityQueue()
  } catch (error) {
    console.log(error)
  }
})()
