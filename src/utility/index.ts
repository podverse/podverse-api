export const chunkArray = (arr, chunkSize = 10) => {
  let i
  let j
  let chunks = []
  for (i = 0, j = arr.length; i < j; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }
  return chunks
}

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
