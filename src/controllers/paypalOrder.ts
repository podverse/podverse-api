import { getRepository } from 'typeorm'
import { addYearsToUserMembershipExpiration } from '~/controllers/user'
import { PayPalOrder, User } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
const createError = require('http-errors')

const createPayPalOrder = async (obj) => {
  const repository = getRepository(PayPalOrder)
  const paypalOrder = await repository.findOne({ paymentID: obj.paymentID })

  if (paypalOrder) {
    throw new createError.Unauthorized('A PayPal order with that id already exists.')
  } else {
    const paypalOrder = new PayPalOrder()
    const newPayPalOrder = Object.assign(paypalOrder, obj)
    await validateClassOrThrow(newPayPalOrder)
    await repository.save(newPayPalOrder)
    return newPayPalOrder
  }
}

const getPayPalOrder = async (id, loggedInUserId) => {
  const repository = getRepository(PayPalOrder)

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Login to get PayPalOrder by id')
  }

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

  if (paypalOrder.owner.id === loggedInUserId) {
    return paypalOrder
  } else {
    throw new createError.Unauthorized(`You don't have permission to get this PayPalOrder by id`)
  }
}

const completePayPalOrder = async (paymentID, state, isV2) => {
  const paypalOrderRepository = getRepository(PayPalOrder)
  const paypalOrder = await paypalOrderRepository.findOne({
    where: { paymentID },
    relations: ['owner']
  })

  if (!paypalOrder) {
    throw new createError.NotFound('PayPalOrder not found')
  }

  if (paypalOrder && paypalOrder.state === 'approved') {
    throw new createError.BadRequest('PayPalOrder has already been approved.')
  }

  const cleanedPayPalOrderObj = {
    paymentID,
    state
  }

  await paypalOrderRepository.update(paymentID, cleanedPayPalOrderObj)

  const userRepository = getRepository(User)
  const user = await userRepository.findOne({
    where: {
      id: paypalOrder.owner.id
    },
    select: ['id', 'membershipExpiration']
  })

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  const successState = isV2 ? 'completed' : 'approved'

  if (user && cleanedPayPalOrderObj.state === successState) {
    await addYearsToUserMembershipExpiration(user.id, 1)
  } else {
    console.log('completePayPalOrder: something went wrong', cleanedPayPalOrderObj)
  }

  return
}

export { completePayPalOrder, createPayPalOrder, getPayPalOrder }
