import { refreshMediaRefsVideosMaterializedView } from 'podverse-orm'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    await connectToDb()
    await refreshMediaRefsVideosMaterializedView()
  } catch (error) {
    console.log(error)
  }
})()
