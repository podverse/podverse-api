import { addAllPublicFeedUrlsToQueue } from '~/services/queue'
;(async function () {
  try {
    let offset = (process.argv.length > 2 ? process.argv[2] : 1) as any
    offset = parseInt(offset, 10)
    await addAllPublicFeedUrlsToQueue(offset)
  } catch (error) {
    console.log(error)
  }
})()
