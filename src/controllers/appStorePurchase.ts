import { getRepository } from 'typeorm'
import { AppStorePurchase } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
const createError = require('http-errors')

const createAppStorePurchase = async (obj) => {
  const repository = getRepository(AppStorePurchase)
  const appStorePurchase = new AppStorePurchase()
  const newAppStorePurchase = Object.assign(appStorePurchase, obj)
  await validateClassOrThrow(newAppStorePurchase)
  await repository.save(newAppStorePurchase)
  return newAppStorePurchase
}

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

const updateAppStorePurchase = async (obj, loggedInUserId) => {
  const repository = getRepository(AppStorePurchase)
  const appStorePurchase = await repository.findOne(
    { transactionId: obj.transactionId },
    { relations: ['owner'] }
  )

  if (!appStorePurchase) {
    throw new createError.NotFound('App Store Purchase not found')
  }

  if (appStorePurchase.owner && appStorePurchase.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Unauthorized')
  }

  const newAppStorePurchase = Object.assign(appStorePurchase, obj)
  await validateClassOrThrow(newAppStorePurchase)
  await repository.save(newAppStorePurchase)
  return newAppStorePurchase
}

export {
  createAppStorePurchase,
  getAppStorePurchase,
  updateAppStorePurchase
}
