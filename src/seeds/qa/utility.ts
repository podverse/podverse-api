import {
  getQAUserByEmail,
  userFreeTrialExpiredEmail,
  userFreeTrialValidEmail,
  userPremiumExpiredEmail,
  userPremiumValidEmail
} from './users'

export const generateQAItemsForUsers = async (func) => {
  const userFreeTrialValid = await getQAUserByEmail(userFreeTrialValidEmail)
  const userFreeTrialExpired = await getQAUserByEmail(userFreeTrialExpiredEmail)
  const userPremiumValid = await getQAUserByEmail(userPremiumValidEmail)
  const userPremiumExpired = await getQAUserByEmail(userPremiumExpiredEmail)

  if (userFreeTrialValid && userFreeTrialExpired && userPremiumValid && userPremiumExpired) {
    await func(userFreeTrialValid.id)
    await func(userFreeTrialExpired.id)
    await func(userPremiumValid.id)
    await func(userPremiumExpired.id)
  }
}

export const getQABatchRange = (arr, index) => {
  const rangeStart = index * 10
  const rangeEnd = (index + 1) * 10
  return arr.slice(rangeStart, rangeEnd)
}
