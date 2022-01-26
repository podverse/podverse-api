import { hideDeadPodcasts } from '~/services/podcastIndex'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    await connectToDb()
    await hideDeadPodcasts()
  } catch (error) {
    console.log(error)
  }
  return
})()
