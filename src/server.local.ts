require('dotenv').config()

import { connectToDb } from 'podverse-orm'
import 'reflect-metadata'
import { createApp } from '~/app'
import { loggerInstance } from './lib/logging'

const port = process.env.PORT || 1234
loggerInstance.debug(`Attempting to start server on port ${port}`)

const startup = async () => {
  await connectToDb()

  const app = await createApp()

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

startup()
