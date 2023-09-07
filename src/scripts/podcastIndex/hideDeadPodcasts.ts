import { hideDeadPodcasts } from '~/services/podcastIndex'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    const fileUrl = process.argv.length > 2 ? process.argv[2] : ''

    await connectToDb()
    await hideDeadPodcasts(fileUrl)
  } catch (error) {
    console.log(error)
  }
  return
})()
