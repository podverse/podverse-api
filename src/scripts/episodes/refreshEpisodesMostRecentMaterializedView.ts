import { connectToDb } from '~/lib/db'
import { refreshEpisodesMostRecentMaterializedView } from '~/controllers/episode'
;(async function () {
  try {
    await connectToDb()
    await refreshEpisodesMostRecentMaterializedView()
  } catch (error) {
    console.log(error)
  }
})()
