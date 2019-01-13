import { getRepository } from 'typeorm'
import { CoingateOrder, User } from 'entities'
import { validateClassOrThrow } from 'lib/errors'
const createError = require('http-errors')

// const orderStatuses = [
//   'new',
//   'pending',
//   'confirming',
//   'paid',
//   'invalid',
//   'expired',
//   'canceled',
//   'refunded'
// ]

// After working on understanding Coingate payments for a few weeks,
// I just learned they don't accept payments for US businesses :(
// Sooo abandonning Coingate...but leaving Coingate code in the project
// since it is mostly setup already...

const createCoingateOrder = async (loggedInUserId) => {
  const repository = getRepository(CoingateOrder)
  const coingateOrder = new CoingateOrder()

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Login to create a CoingateOrder')
  }

  coingateOrder.owner = loggedInUserId

  await validateClassOrThrow(coingateOrder)

  await repository.save(coingateOrder)
  return coingateOrder
}

const getCoingateOrder = async (id, loggedInUserId, includeToken = false) => {
  const repository = getRepository(CoingateOrder)
  let select = [
    'id',
    'orderCreatedAt',
    'paymentUrl',
    'priceAmount',
    'priceCurrency',
    'receiveAmount',
    'receiveCurrency',
    'status'
  ]

  if (includeToken) {
    select.push('token')
  }

  const coingateOrder = await repository.findOne(
    { id },
    // @ts-ignore
    {
      relations: ['owner'],
      select
    }
  )

  if (!coingateOrder) {
    throw new createError.NotFound('CoingateOrder not found')
  }

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Login to get CoingateOrder by id')
  }
  if (coingateOrder.owner.id === loggedInUserId) {
    return coingateOrder
  } else {
    throw new createError.Unauthorized(`You don't have permission to get this CoingateOrder by id`)
  }
}

const updateCoingateOrder = async (obj, loggedInUserId) => {
  const { id, orderCreatedAt, paymentUrl, priceAmount, priceCurrency, receiveAmount,
    receiveCurrency, status, token } = obj
  const coingateOrderRepository = getRepository(CoingateOrder)

  let select = [
    'id',
    'orderCreatedAt',
    'paymentUrl',
    'priceAmount',
    'priceCurrency',
    'receiveAmount',
    'receiveCurrency',
    'status',
    'token'
  ]

  const coingateOrder = await coingateOrderRepository.findOne({
    // @ts-ignore
    where: { id },
    relations: ['owner'],
    select
  })

  if (!coingateOrder) {
    throw new createError.NotFound('CoingateOrder not found')
  }

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Login to update CoingateOrder by id')
  }

  if (coingateOrder.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized(`You are not authorized to update this CoingateOrder`)
  }

  if (coingateOrder.token !== token) {
    throw new createError.Unauthorized('Invalid CoingateOrder verification token')
  }

  if (coingateOrder && coingateOrder.status === 'paid') {
    throw new createError.BadRequest('CoingateOrder has already been completed')
  }

  const cleanedCoingateOrderObj = {
    id,
    orderCreatedAt,
    paymentUrl,
    priceAmount,
    priceCurrency,
    receiveAmount,
    receiveCurrency,
    status,
    token
  }

  await coingateOrderRepository.update(coingateOrder.id, cleanedCoingateOrderObj)

  const userRepository = getRepository(User)
  const user = await userRepository.findOne({
    where: {
      id: coingateOrder.owner.id
    }
  })

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  if (user.id !== loggedInUserId) {
    throw new createError.Unauthorized(`You are not authorized to update this CoingateOrder`)
  }

  if (user && cleanedCoingateOrderObj.status === 'paid') {
    const newExpirationDate = user.membershipExpiration ? new Date(user.membershipExpiration) : new Date()
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1)

    await userRepository.update(user.id, { membershipExpiration: newExpirationDate })
  } else {
    console.log('completeCoingateOrder: something went wrong', cleanedCoingateOrderObj)
  }

  return
}

export {
  createCoingateOrder,
  getCoingateOrder,
  updateCoingateOrder
}
