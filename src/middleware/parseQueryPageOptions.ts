import { validateQueryPageOptions } from './validation/base'

export const parseQueryPageOptions = async (ctx, next) => {

  const query = ctx.request.query

  let options = {
    order: {},
    skip: 0,
    take: 20
  }

  const { order, orderAsc, skip, take } = query

  if (order) {
    options.order[order] = orderAsc === 'true' ? 'DESC' : 'ASC'
    delete query.order
    if (orderAsc) {
      delete query.orderAsc
    }
  }

  if (skip) {
    options.skip = parseInt(skip, 10)
    query.skip = null
    delete query.skip
  }

  if (take) {
    options.take = parseInt(take, 10)
    delete query.take
  }

  ctx.request.query = query
  ctx.state.queryPageOptions = options

  await validateQueryPageOptions(ctx, next)
}
