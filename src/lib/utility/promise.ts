// Helper function by salezica on Stack Overflow
// https://stackoverflow.com/a/43503921/2608858
export const promiseAllSkippingErrors = (promises) => {
  return Promise.all(promises.map((p) => p.catch((error) => null)))
}
