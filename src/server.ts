import 'reflect-metadata'
import { createApp } from '~/app'
import { connectToDb } from '~/lib/db'
import { loggerInstance } from './lib/logging'

const port = process.env.PORT || 1234
loggerInstance.debug(`Attempting to start server on port ${port}`)

connectToDb().then(
  async (connection) => {
    loggerInstance.debug('database connected')
    if (connection) {
      const app = await createApp(connection)

      app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
      })
    } else {
      loggerInstance.error('Unexpected: connection was falsy')
    }
  },
  (err) => {
    loggerInstance.error('Failed to connect to the database')
    console.error(err)
  }
)
