require('dotenv').config()

import 'reflect-metadata'
import { createApp } from '~/app'
import { connectToDb } from '~/lib/db'

export const createTestApp = () => {
  return connectToDb().then(async (connection) => {
    if (connection) {
      const app = await createApp(connection)
      return [app.listen(), connection]
    }
    return null
  })
}
