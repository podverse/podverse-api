import { getRepository } from 'typeorm'
import { AccountClaimToken } from '~/entities'
import { addYearsToUserMembershipExpiration, getUserByEmail } from './user'
const createError = require('http-errors')

const getAccountClaimToken = async (id: string) => {
  const repository = getRepository(AccountClaimToken)
  // WARNING: Do NOT select the user's email in this method,
  // since it is public facing and could accidentally reveal PII.
  const accountClaimToken = await repository.findOne(
    { id },
    {
      select: ['id', 'claimed', 'yearsToAdd']
    }
  )

  if (!accountClaimToken) {
    throw new createError.NotFound('AccountClaimToken not found')
  }

  if (accountClaimToken.claimed) {
    throw new createError.BadRequest('This token has already been claimed.')
  }

  return accountClaimToken
}

const redeemAccountClaimToken = async (id: string) => {
  const repository = getRepository(AccountClaimToken)
  const accountClaimToken = await repository.findOne(
    { id },
    {
      select: ['email', 'id', 'claimed', 'yearsToAdd']
    }
  )

  if (!accountClaimToken) {
    throw new createError.NotFound('User not found')
  } else if (accountClaimToken.claimed) {
    throw new createError.BadRequest('This token has already been claimed.')
  } else if (!accountClaimToken.claimed) {
    const user = await getUserByEmail(accountClaimToken.email)
    await addYearsToUserMembershipExpiration(user.id, accountClaimToken.yearsToAdd)
  }
}

export {
  getAccountClaimToken,
  redeemAccountClaimToken
}
