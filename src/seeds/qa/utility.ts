export const getQABatchRange = (arr, index) => {
  const rangeStart = index * 10
  const rangeEnd = (index + 1) * 10
  return arr.slice(rangeStart, rangeEnd)
}
