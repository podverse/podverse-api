import { getRepository } from 'typeorm'
import { AccountClaimToken } from '~/entities'
import { errorMessages, validateClassOrThrow } from '~/lib/errors'
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

const redeemAccountClaimToken = async (id: string, email: string) => {
  const repository = getRepository(AccountClaimToken)

  const accountClaimToken = await repository.findOne(
    { id },
    {
      select: ['id', 'claimed', 'yearsToAdd']
    }
  )

  if (!accountClaimToken) {
    throw new createError.NotFound(errorMessages.accountClaimToken.redeem.accountClaimTokenNotFound)
  } else if (accountClaimToken.claimed) {
    throw new createError.BadRequest(errorMessages.accountClaimToken.redeem.alreadyClaimed)
  } else if (!accountClaimToken.claimed) {
    const user = await getUserByEmail(email)
    await addYearsToUserMembershipExpiration(user.id, accountClaimToken.yearsToAdd)
    accountClaimToken.claimed = true
    await validateClassOrThrow(accountClaimToken)
    await repository.save(accountClaimToken)
  }
}

export { getAccountClaimToken, redeemAccountClaimToken }
