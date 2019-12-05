import { getRepository } from 'typeorm'
import { addYearsToUserMembershipExpiration } from '~/controllers/user'
import { AppStorePurchase } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
const createError = require('http-errors')

const getAppStorePurchase = async (transactionId, loggedInUserId) => {
  const repository = getRepository(AppStorePurchase)

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Login to get App Store Purchase by order id')
  }

  const appStorePurchase = await repository.findOne(
    { transactionId },
    { relations: ['owner'] }
  )

  if (!appStorePurchase) {
    return null
  }

  if (appStorePurchase.owner.id === loggedInUserId) {
    return appStorePurchase
  } else {
    throw new createError.Unauthorized(`You don't have permission to get this App Store Purchase by order id`)
  }
}

const formatAppStorePurchaseAndTransaction = (appStorePurchase, transaction, loggedInUserId) => {
  appStorePurchase.transactionId = transaction.transaction_id
  delete transaction.transaction_id
  appStorePurchase.owner = loggedInUserId
  const formattedAppStorePurchase = appStorePurchase
  const formattedTransaction = transaction
  return { formattedAppStorePurchase, formattedTransaction }
}

const createAppStorePurchase = async (transaction, loggedInUserId) => {
  if (!loggedInUserId) {
    throw new createError.Unauthorized('Login to get App Store Purchase by order id')
  }

  const repository = getRepository(AppStorePurchase)
  const appStorePurchase = new AppStorePurchase()
  const { formattedAppStorePurchase, formattedTransaction } = formatAppStorePurchaseAndTransaction(appStorePurchase, transaction, loggedInUserId)
  const newAppStorePurchase = Object.assign(formattedAppStorePurchase, formattedTransaction)
  await validateClassOrThrow(newAppStorePurchase)
  await repository.save(newAppStorePurchase)
  return newAppStorePurchase
}

const createOrUpdateAppStorePurchase = async (transaction, loggedInUserId) => {
  const purchase = await getAppStorePurchase(transaction.transaction_id, loggedInUserId)

  if (!purchase) {
    const newAppStorePurchase = await createAppStorePurchase(transaction, loggedInUserId)
    const { quantity } = newAppStorePurchase
    for (let i = 0; i < quantity; i++) {
      await addYearsToUserMembershipExpiration(loggedInUserId, 1)
    }
    return newAppStorePurchase
  } else {
    return updateAppStorePurchase(transaction, loggedInUserId)
  }
}

const updateAppStorePurchase = async (transaction, loggedInUserId) => {
  const repository = getRepository(AppStorePurchase)

  const appStorePurchase = await repository.findOne(
    { transactionId: transaction.transaction_id },
    { relations: ['owner'] }
  )

  if (!appStorePurchase) {
    throw new createError.NotFound('App Store Purchase not found')
  }

  if (appStorePurchase.owner && appStorePurchase.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Unauthorized')
  }
  const { formattedAppStorePurchase, formattedTransaction } = formatAppStorePurchaseAndTransaction(appStorePurchase, transaction, loggedInUserId)
  const newAppStorePurchase = Object.assign(formattedAppStorePurchase, formattedTransaction)
  await validateClassOrThrow(newAppStorePurchase)
  await repository.save(newAppStorePurchase)
  return newAppStorePurchase
}

export {
  createOrUpdateAppStorePurchase,
  getAppStorePurchase
}
