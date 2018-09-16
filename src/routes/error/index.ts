export const emitError = (error, ctx, status, message) => {
  ctx.status = status || 500
  ctx.body = message || error.message
  ctx.app.emit('error', error, ctx)
}
