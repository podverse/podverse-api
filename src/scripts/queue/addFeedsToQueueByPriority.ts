import { addFeedsToQueueByPriority } from '~/services/queue'
;(async function () {
  try {
    let parserPriority = (process.argv.length > 2 ? process.argv[2] : 3) as any
    let offset = (process.argv.length > 3 ? process.argv[3] : 0) as any
    parserPriority = parseInt(parserPriority, 10)
    offset = parseInt(offset, 10)
    await addFeedsToQueueByPriority(parserPriority, offset)
  } catch (error) {
    console.log(error)
  }
})()
