import { connectToDb } from '~/lib/db'
import { updateRecentEpisodesTables } from '~/controllers/recentEpisodes'
;(async function () {
  try {
    await connectToDb()
    await updateRecentEpisodesTables()
  } catch (error) {
    console.log(error)
  }
})()
