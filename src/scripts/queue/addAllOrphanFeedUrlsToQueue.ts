import { addAllOrphanFeedUrlsToQueue } from '~/services/queue'

(async function () {
  try {
    const priority = process.argv[2]

    if (!priority) {
      console.log('You must provide a priority queue number (1-5) as a parameter.')
      return
    }

    await addAllOrphanFeedUrlsToQueue(priority)
  } catch (error) {
    console.log(error)
  }
})()
