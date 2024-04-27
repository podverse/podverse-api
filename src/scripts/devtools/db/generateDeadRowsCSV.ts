import { generateDeadRowsCSV as generateDeadRowsCSVCont } from '~/controllers/devtools/db'
import { connectToDb } from '~/lib/db'
;(async function () {
  const generateDeadRowCSV = async () => {
    try {
      const connection = await connectToDb()

      if (connection && connection.isConnected) {
        await generateDeadRowsCSVCont()
      }
    } catch (error) {
      console.log(error)
    }
  }

  generateDeadRowCSV()
})()
