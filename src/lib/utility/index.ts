export { validatePassword } from '~/lib/utility/validation'
import { performance } from 'perf_hooks'

export const delimitQueryValues = (ctx, keys) => {
  const query = ctx.state.query

  for (const key of keys) {
    if (query[key]) {
      query[key] = query[key].split(',')
    }
  }

  ctx.state.query = query
  return ctx
}

export const chunkArray = (arr, chunkSize = 10) => {
  let i
  let j
  const chunks = []
  for (i = 0, j = arr.length; i < j; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize) as never // TODO: What does this mean?
    chunks.push(chunk)
  }
  return chunks
}

export const offsetDate = (minutesOffset = 0) => {
  const todayDate = new Date()
  todayDate.setMinutes((todayDate.getMinutes() - todayDate.getTimezoneOffset()) + minutesOffset)
  return todayDate.toISOString().slice(0, 10)
}

// NOTE: I am manually offsetting by 5 hours since the server is in UTC but the
// Google Analytics data is in CST.
// This WILL cause a problem when DST happens.
export const lastHour = () => {
  const todayDate = new Date()
  todayDate.setMinutes((todayDate.getMinutes() - todayDate.getTimezoneOffset()) - 300 - 60)
  const lastHour = todayDate.toISOString().slice(11, 13)
  return parseInt(lastHour, 10)
}

export const convertSecondsToDaysText = (seconds) => {
  const totalDays = Math.round(parseInt(seconds, 10) / 86400)
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

export const getQueryOrderColumn = (type, sort, sortDateKey) => {
  if (sort === 'top-past-hour') {
    return [`${type}.pastHourTotalUniquePageviews`, 'DESC']
  } else if (sort === 'top-past-day') {
    return [`${type}.pastDayTotalUniquePageviews`, 'DESC']
  } else if (sort === 'top-past-month') {
    return [`${type}.pastMonthTotalUniquePageviews`, 'DESC']
  } else if (sort === 'top-past-year') {
    return [`${type}.pastYearTotalUniquePageviews`, 'DESC']
  } else if (sort === 'top-all-time') {
    return [`${type}.pastAllTimeTotalUniquePageviews`, 'DESC']
  } else if (sort === 'most-recent') {
    return [`${type}.${sortDateKey}`, 'DESC']
  } else if (sort === 'oldest') {
    return [`${type}.${sortDateKey}`, 'ASC']
  } else if (sort === 'alphabetical') {
    return [`${type}.sortableTitle`, 'ASC']
  } else if (sort === 'random') {
    return [`RANDOM()`]
  } else if (sort === 'chronological' && type === 'mediaRef') {
    return [`${type}.startTime`, 'ASC']
  } else { // sort = top-past-week
    return [`${type}.pastWeekTotalUniquePageviews`, 'DESC']
  }
}

// eslint-disable-next-line
// @ts-ignore
Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}

export const isBeforeDate = (expirationDate, dayOffset = 0) => {
  const currentDate = new Date() as any
  
  const offsetDate = currentDate.addDays(dayOffset)
  return new Date(expirationDate) > offsetDate
}

export const removeObjectKeysWithEmptyValues = obj =>
  Object.keys(obj).forEach((key) => (obj[key] == null) && delete obj[key])

export const convertToSlug = str => str.replace(/\s+/g, '-').toLowerCase().replace(/\W/g, '').trim()

export const isValidDate = (date: any) => date instanceof Date && !isNaN(date as any)

export const cleanFileExtension = (fileExtension: string) => {
  // If an invalid extension is provided, try to correct it.
  if (fileExtension.indexOf('png') >= 0) {
    return 'png'
  } else if (fileExtension.indexOf('jpg') >= 0) {
    return 'jpg'
  } else if (fileExtension.indexOf('jpeg') >= 0) {
    return 'jpeg'
  } else {
    return 'png'
  }
}

export const getImageContentTypeHeader = (cleanedFileExtension: string) => {
  if (cleanedFileExtension === 'jpg') {
    return 'image/jpg'
  } else if (cleanedFileExtension === 'jpeg') {
    return 'image/jpeg'
  } else {
    return 'image/png'
  }
}

export const logPerformance = (subject: string, stage: string, notes = '') => {
  console.log(subject + ',' + stage + ',' + Math.ceil(performance.now()).toString() + 'ms' + ',' + notes + ',')
}

export const _logStart = 'start'
export const _logEnd = 'end'
