require('dotenv').config({ path: './env' })

import 'reflect-metadata'
import { createApp } from 'app'
import { connectToDb } from 'db'
import { seedDatabase } from 'seeds/db'

const port = process.env.PORT || 3000

connectToDb()
  .then(async connection => {

    if (connection) {
      // await seedDatabase(connection)

      const app = createApp(connection)

      app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
      })
    }
  })
