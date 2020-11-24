import { addNewFeedsToPriorityQueue } from '~/services/podcastIndex'

(async function () {
  try {
    await addNewFeedsToPriorityQueue()
  } catch (error) {
    console.log(error)
  }
})()
