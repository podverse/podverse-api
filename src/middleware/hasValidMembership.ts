import { getRepository } from 'typeorm'
import { User } from '~/entities'
import { isBeforeDate } from '~/lib/utility'
const createError = require('http-errors')

export const hasValidMembership = async (ctx, next) => {
  if (ctx.state.user && ctx.state.user.id) {
    const repository = getRepository(User)
    const user = await repository.findOne(
      {
        where: {
          id: ctx.state.user.id
        },
        select: [
          'freeTrialExpiration',
          'membershipExpiration',
          'emailVerified'
        ]
      }
    )

    if (!user) {
      throw new createError.NotFound('User not found')
    }

    if (!user.emailVerified) {
      ctx.status = 401
      ctx.body = {
        message: 'Email Verification Required',
        code: 124
      }
      return
    }

    if (
      (user.membershipExpiration && isBeforeDate(user.membershipExpiration))
      || (user.freeTrialExpiration && isBeforeDate(user.freeTrialExpiration))
    ) {
      await next()
      return
    }
  }

  ctx.status = 401
  ctx.body = {
    message: 'Premium Membership Required',
    code: 123
  }
}

export const hasValidMembershipIfJwt = async (ctx, next) => {
  if (ctx.state.user && ctx.state.user.id) {
    await hasValidMembership(ctx, next)
  } else {
    await next()
  }
}
