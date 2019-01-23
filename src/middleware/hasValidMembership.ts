import { getRepository } from 'typeorm'
import { User } from '~/entities'
import { isBeforeDate } from '~/lib/utility'
const createError = require('http-errors')

export const hasValidMembership = async (ctx, next) => {
  if (ctx.state.user && ctx.state.user.id) {
    const repository = getRepository(User)
    let user = await repository.findOne(
      {
        where: {
          id: ctx.state.user.id
        },
        select: [
          'freeTrialExpiration',
          'membershipExpiration'
        ]
      }
    )

    if (!user) {
      throw new createError.NotFound('User not found')
    }

    if (
      (user.membershipExpiration && isBeforeDate(user.membershipExpiration))
      || (user.freeTrialExpiration && isBeforeDate(user.freeTrialExpiration))
    ) {
      await next()
    } else {
      ctx.status = 401
      ctx.body = 'Premium Membership Required'
    }
  } else {
    ctx.status = 401
    ctx.body = 'Premium Membership Required'
  }
}

export const hasValidMembershipIfJwt = async (ctx, next) => {
  if (ctx.state.user && ctx.state.user.id) {
    await hasValidMembership(ctx, next)
  } else {
    await next()
  }
}
