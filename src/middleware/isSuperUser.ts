import { getRepository } from 'typeorm'
import { User } from '~/entities'
const createError = require('http-errors')

export const isSuperUser = async (ctx, next) => {
  if (ctx.state.user && ctx.state.user.id) {
    const repository = getRepository(User)
    let user = await repository.findOne(
      {
        // @ts-ignore
        where: {
          id: ctx.state.user.id
        },
        select: [
          'isSuperUser'
        ]
      }
    )

    if (!user) {
      throw new createError.NotFound('User not found')
    }

    if (user.isSuperUser) {
      await next()
      return
    }
  }

  ctx.status = 401
}
