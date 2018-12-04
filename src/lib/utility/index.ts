export { validatePassword } from 'lib/utility/validation'

export const delimitQueryValues = (ctx, keys) => {
  let query = ctx.request.query

  for (const key of keys) {
    if (query[key]) {
      query[key] = query[key].split(',')
    }
  }

  ctx.request.query = query
  return ctx
}

export const chunkArray = (arr, chunkSize = 10) => {
  let i
  let j
  let chunks = []
  for (i = 0, j = arr.length; i < j; i += chunkSize) {
    let chunk = arr.slice(i, i + chunkSize) as never // TODO: What does this mean?
    chunks.push(chunk)
  }
  return chunks
}

export const offsetDate = (minutesOffset = 0) => {
  let todayDate = new Date()
  todayDate.setMinutes((todayDate.getMinutes() - todayDate.getTimezoneOffset()) + minutesOffset)
  return todayDate.toISOString().slice(0, 10)
}

// NOTE: I am manually offsetting by 5 hours since the server is in UTC but the
// Google Analytics data is in CST.
// This WILL cause a problem when DST happens.
export const lastHour = () => {
  let todayDate = new Date()
  todayDate.setMinutes((todayDate.getMinutes() - todayDate.getTimezoneOffset()) - 300 - 60)
  let lastHour = todayDate.toISOString().slice(11, 13)
  return parseInt(lastHour, 10)
}

export const convertSecondsToDaysText = (seconds) => {
  const totalDays = Math.round(parseInt(seconds) / 86400)
  return `${totalDays > 1 ? `${totalDays} days` : '24 hours'}`
}

export const convertSecToHHMMSS = (sec: number) => {
  const totalSec = Math.floor(sec)
  const hours = totalSec / 3600 % 24
  const minutes = totalSec / 60 % 60
  const seconds = totalSec % 60
  let result = ''

  if (hours > 0) {
    result += hours + ':'
  }

  if (minutes > 9) {
    result += minutes + ':'
  } else if (minutes > 0 && hours > 0) {
    result += '0' + minutes + ':'
  } else if (minutes > 0) {
    result += minutes + ':'
  } else if (minutes === 0 && hours > 0) {
    result += '00:'
  }

  if (seconds > 9) {
    result += seconds
  } else if (seconds > 0 && minutes > 0) {
    result += '0' + seconds
  } else if (seconds > 0) {
    result += seconds
  } else {
    result += '00'
  }

  if (result.length === 2) {
    result = '0:' + result
  }

  if (result.length === 1) {
    result = '0:0' + result
  }

  return result
}

export const createQueryOrderObject = (sort, sortDateKey) => {
  let order: any = {}

  if (sort === 'top-past-hour') {
    order.pastHourTotalUniquePageviews = 'DESC'
  } else if (sort === 'top-past-day') {
    order.pastDayTotalUniquePageviews = 'DESC'
  } else if (sort === 'top-past-month') {
    order.pastMonthTotalUniquePageviews = 'DESC'
  } else if (sort === 'top-past-year') {
    order.pastYearTotalUniquePageviews = 'DESC'
  } else if (sort === 'top-all-time') {
    order.pastAllTimeTotalUniquePageviews = 'DESC'
  } else if (sort === 'most-recent') {
    order[sortDateKey] = 'DESC'
  } else { // sort = top-past-week
    order.pastWeekTotalUniquePageviews = 'DESC'
  }

  return order
}
