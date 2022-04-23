import { connectToDb } from '~/lib/db'
import { refreshMediaRefsVideosMaterializedView } from '~/controllers/mediaRef'
;(async function () {
  try {
    await connectToDb()
    await refreshMediaRefsVideosMaterializedView()
  } catch (error) {
    console.log(error)
  }
})()
