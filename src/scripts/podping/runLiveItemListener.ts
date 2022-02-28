import { connectToDb } from '~/lib/db'
import { runLiveItemListener } from '~/services/podping'
;(async function () {
  await connectToDb()

  try {
    await runLiveItemListener()
  } catch (error) {
    console.log(error)
  }
})()
