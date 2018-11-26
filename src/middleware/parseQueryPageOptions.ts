export const parseQueryPageOptions = async (ctx, next) => {

  const query = ctx.request.query

  let options = {
    sort: '',
    skip: 0,
    take: 2
  }

  const { page, sort, take } = query

  if (sort) {
    options.sort = sort
  }

  if (take) {
    options.take = parseInt(take, 10)
  }

  if (page) {
    options.skip = (parseInt(page, 10) * take) - 1
  }

  ctx.request.query = options

  await next(ctx)
}
