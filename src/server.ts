import 'reflect-metadata'
import { createApp } from '~/app'
import { connectToDb } from '~/lib/db'

const port = process.env.PORT || 1234

connectToDb().then(async (connection) => {
  if (connection) {
    const app = await createApp(connection)

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  }
})
