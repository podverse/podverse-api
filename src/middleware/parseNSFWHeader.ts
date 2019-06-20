export const parseNSFWHeader = async (ctx, next) => {
  // const includeNSFW = ctx.headers.nsfwmode && ctx.headers.nsfwmode === 'on'
  // NOTE: disabling NSFW filtering since it's not a polished feature
  // ctx.state.includeNSFW = includeNSFW
  ctx.state.includeNSFW = true
  await next(ctx)
}
