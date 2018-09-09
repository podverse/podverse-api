export const logError = (msg, error, data) => {
  if (msg) {
    console.error(msg)
  }

  for (const key of Object.keys(data)) {
    console.error(`${key} ${data[key]}`)
  }

  if (error) {
    console.error(error)
  }
}
