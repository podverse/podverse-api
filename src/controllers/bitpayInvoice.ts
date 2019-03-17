import { getRepository } from 'typeorm'
import { BitPayInvoice, User } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
const createError = require('http-errors')

/*
  invoiceStates = [
    'new', 'paid', 'confirmed', 'complete', 'expired', 'invalid',
    'false', 'paidPartial', 'paidOver'
  ]
*/

const createBitPayInvoiceLocal = async (data, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Login to create a BitPayInvoice')
  }

  const userRepository = getRepository(User)
  const user = await userRepository.findOne({ id: loggedInUserId })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const repository = getRepository(BitPayInvoice)
  const bitpayInvoice = new BitPayInvoice()

  bitpayInvoice.id = data.id
  bitpayInvoice.orderId = data.orderId
  bitpayInvoice.amountPaid = data.amountPaid
  bitpayInvoice.currency = data.currency
  bitpayInvoice.exceptionStatus = data.exceptionStatus
  bitpayInvoice.price = data.price
  bitpayInvoice.status = data.status
  bitpayInvoice.token = data.token
  bitpayInvoice.transactionCurrency = data.transactionCurrency
  bitpayInvoice.transactionSpeed = data.transactionSpeed
  bitpayInvoice.url = data.url
  bitpayInvoice.owner = loggedInUserId

  await validateClassOrThrow(bitpayInvoice)

  await repository.save(bitpayInvoice)
  return bitpayInvoice
}

const getBitPayInvoiceStatusLocal = async (id, loggedInUserId) => {
  const repository = getRepository(BitPayInvoice)
  let select = [
    'id',
    'status'
  ]

  const bitpayInvoice = await repository.findOne(
    { id },
    // @ts-ignore
    {
      relations: ['owner'],
      select
    }
  )

  if (!bitpayInvoice) {
    throw new createError.NotFound('BitPayInvoice not found')
  }

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Login to get BitPayInvoice by id')
  }
  if (bitpayInvoice.owner.id === loggedInUserId) {
    return bitpayInvoice.status
  } else {
    throw new createError.Unauthorized(`You don't have permission to get this BitPayInvoice by id`)
  }
}

const updateBitPayInvoiceLocal = async data => {
  const { amountPaid, currency, exceptionStatus, id, price, status,
    transactionCurrency, transactionSpeed, url } = data

  const repository = getRepository(BitPayInvoice)

  let select = [
    'id',
    'amountPaid',
    'currency',
    'exceptionStatus',
    'price',
    'status',
    'transactionCurrency',
    'transactionSpeed',
    'url'
  ]

  const bitpayInvoice = await repository.findOne({
    // @ts-ignore
    where: { id },
    relations: ['owner'],
    select
  })

  if (!bitpayInvoice) {
    throw new createError.NotFound('BitPayInvoice not found')
  }

  if (bitpayInvoice && bitpayInvoice.status === 'confirmed') {
    throw new createError.BadRequest('BitPayInvoice has already been confirmed')
  }

  const cleanedBitPayInvoiceObj = {
    amountPaid,
    currency,
    exceptionStatus,
    id,
    price,
    status,
    transactionCurrency,
    transactionSpeed,
    url
  }

  await repository.update(id, cleanedBitPayInvoiceObj)

  const userRepository = getRepository(User)
  const user = await userRepository.findOne({
    where: {
      id: bitpayInvoice.owner.id
    }
  })

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  if (user && cleanedBitPayInvoiceObj.status === 'confirmed') {
    const newExpirationDate = user.membershipExpiration ? new Date(user.membershipExpiration) : new Date()
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1)

    await userRepository.update(user.id, { membershipExpiration: newExpirationDate })
  }

  return
}

export {
  createBitPayInvoiceLocal,
  getBitPayInvoiceStatusLocal,
  updateBitPayInvoiceLocal
}
