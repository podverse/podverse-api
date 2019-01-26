export const parseNSFWHeader = async (ctx, next) => {
  const includeNSFW = ctx.headers.nsfwmode && ctx.headers.nsfwmode === 'on'
  ctx.state.includeNSFW = includeNSFW
  await next(ctx)
}
