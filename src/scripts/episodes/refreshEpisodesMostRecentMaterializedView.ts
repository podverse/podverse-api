import { refreshEpisodesMostRecentMaterializedView } from 'podverse-orm'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    await connectToDb()
    await refreshEpisodesMostRecentMaterializedView()
  } catch (error) {
    console.log(error)
  }
})()
