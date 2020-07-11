const { createTestApp } = require('../../src/server-test')

beforeAll(async () => {
  console.log('setupTests beforeAll')
  const testServer = await createTestApp()
  global.app = testServer[0]
  global.connection = testServer[1]
})

afterAll(async () => {
  await global.connection.close()
  await global.app.close()
  console.log('setupTests afterAll')
})
