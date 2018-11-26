export const parseQueryPageOptions = async (ctx, next) => {

  const query = ctx.request.query

  let options = {
    sort: '',
    skip: 0,
    take: 10
  }

  const { page, sort } = query

  if (sort) {
    options.sort = sort
  }

  if (page > 1) {
    options.skip = (((parseInt(page, 10) - 1) * options.take))
  }

  ctx.request.query = options

  await next(ctx)
}
