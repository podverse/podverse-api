import { addAllOrphanFeedUrlsToPriorityQueue } from '~/services/queue'
;(async function () {
  try {
    await addAllOrphanFeedUrlsToPriorityQueue()
  } catch (error) {
    console.log(error)
  }
})()
