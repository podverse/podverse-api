import { backupDatabaseToS3 } from '~/services/backupDatabase'

;(async function () {
  try {
    await backupDatabaseToS3()
  } catch (error) {
    console.log(error)
  }
})()
