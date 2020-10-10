import { addNonAuthorityFeedUrlsToPriorityQueue } from '~/services/queue'

(async function () {
  try {
    await addNonAuthorityFeedUrlsToPriorityQueue()
  } catch (error) {
    console.log(error)
  }
})()
