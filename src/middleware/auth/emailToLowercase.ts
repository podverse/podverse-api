export const emailToLowerCase = async (ctx, next) => {
  ctx.state.email = ctx.request.body.email.toLowerCase()
  await next(ctx)
}
