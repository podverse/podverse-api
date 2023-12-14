import { getRepository, User } from 'podverse-orm'
import createError from 'http-errors'

export const isPodpingAdmin = async (ctx, next) => {
  if (ctx.state.user && ctx.state.user.id) {
    const repository = getRepository(User)
    const user = await repository.findOne({
      where: {
        id: ctx.state.user.id
      },
      select: ['emailVerified', 'isPodpingAdmin']
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

    if (user.isPodpingAdmin) {
      await next()
      return
    }
  }

  ctx.status = 401
  ctx.body = {
    message: 'Podping Admin permissions required',
    code: 777
  }
}
