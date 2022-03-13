import { getRepository } from 'typeorm'
import { User } from '~/entities'
const createError = require('http-errors')

export const isDevAdmin = async (ctx, next) => {
  if (ctx.state.user && ctx.state.user.id) {
    const repository = getRepository(User)
    const user = await repository.findOne({
      where: {
        id: ctx.state.user.id
      },
      select: ['emailVerified', 'isDevAdmin']
    })

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

    if (user.isDevAdmin) {
      await next()
      return
    }
  }

  ctx.status = 401
  ctx.body = {
    message: 'Dev Admin permissions required',
    code: 777
  }
}
