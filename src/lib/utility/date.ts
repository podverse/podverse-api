export const splitDateIntoEqualIntervals = (startDate: Date, endDate: Date, numberOfIntervals: number) => {
  const intervalLength = (endDate.getTime() - startDate.getTime()) / numberOfIntervals
  return [...new Array(numberOfIntervals)].map((e, i) => {
    return {
      start: new Date(startDate.getTime() + i * intervalLength),
      avg: new Date(startDate.getTime() + (i + 0.5) * intervalLength),
      end: new Date(startDate.getTime() + (i + 1) * intervalLength)
    }
  })
}
