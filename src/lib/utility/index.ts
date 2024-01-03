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

export const convertSecondsToDaysText = (seconds) => {
  const totalDays = Math.round(parseInt(seconds, 10) / 86400)
  return `${totalDays > 1 ? `${totalDays} days` : '24 hours'}`
}
