import { getRepository } from 'typeorm'
import { PayPalOrder, User } from 'entities'
import { validateClassOrThrow } from 'lib/errors'
const createError = require('http-errors')

const createPayPalOrder = async (obj) => {
  const repository = getRepository(PayPalOrder)
  const paypalOrder = new PayPalOrder()
  const newPayPalOrder = Object.assign(paypalOrder, obj)

  await validateClassOrThrow(newPayPalOrder)

  await repository.save(newPayPalOrder)
  return newPayPalOrder
}

const getPayPalOrder = async (id, loggedInUserId) => {
  const repository = getRepository(PayPalOrder)

  const paypalOrder = await repository.findOne(
    {
      paymentID: id
    },
    {
      relations: ['owner']
    }
  )

  if (!paypalOrder) {
    throw new createError.NotFound('PayPalOrder not found')
  }

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Login to get PayPalOrder by id')
  }
  if (paypalOrder.owner.id === loggedInUserId) {
    return paypalOrder
  } else {
    throw new createError.Unauthorized(`You don't have permission to get this PayPalOrder by id`)
  }
}

const updatePayPalOrder = async (obj, loggedInUserId) => {
  const repository = getRepository(PayPalOrder)
  const paypalOrder = await repository.findOne({
    where: {
      paymentID: obj.paymentID
    },
    relations: ['owner']
  })

  if (!paypalOrder) {
    throw new createError.NotFound('PayPalOrder not found')
  }

  if (paypalOrder.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Unauthorized attempt to update PayPal Order')
  }

  const cleanedObj = {
    paymentID: obj.paymentID,
    payerID: obj.payerID,
    paymentToken: obj.paymentToken,
    state: obj.state
  }

  const response = await repository.update(paypalOrder.paymentID, cleanedObj)

  return response
}

const completePayPalOrder = async obj => {
  const paypalOrderRepository = getRepository(PayPalOrder)
  const paypalOrder = await paypalOrderRepository.findOne({
    where: {
      paymentID: obj.resource.parent_payment
    },
    relations: ['owner']
  })

  if (!paypalOrder) {
    throw new createError.NotFound('PayPalOrder not found')
  }

  if (paypalOrder && paypalOrder.state === 'completed') {
    throw new createError.BadRequest('PayPalOrder has already been completed')
  }

  const cleanedPayPalOrderObj = {
    paymentID: obj.resource.parent_payment,
    state: obj.resource.state
  }

  await paypalOrderRepository.update(paypalOrder.paymentID, cleanedPayPalOrderObj)

  const userRepository = getRepository(User)
  const user = await userRepository.findOne({
    where: {
      id: paypalOrder.owner.id
    }
  })

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  if (user && cleanedPayPalOrderObj.state === 'completed') {
    const newExpirationDate = user.membershipExpiration ? new Date(user.membershipExpiration) : new Date()
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1)

    await userRepository.update(user.id, { membershipExpiration: newExpirationDate })
  } else {
    console.log('completePayPalOrder: something went wrong', cleanedPayPalOrderObj)
  }

  return
}

export {
  completePayPalOrder,
  createPayPalOrder,
  getPayPalOrder,
  updatePayPalOrder
}
