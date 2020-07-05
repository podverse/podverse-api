require('dotenv').config()

import 'reflect-metadata'
import { createApp } from '~/app'
import { connectToDb } from '~/lib/db'

export const createTestApp = () => {
  return connectToDb()
    .then(connection => {
      return connection ? [createApp(connection).listen(), connection] : null
    })
}
