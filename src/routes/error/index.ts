export const emitError = (error, message, ctx) => {
  ctx.status = error.status || 500
  ctx.body = message || error.message
  ctx.app.emit('error', error, ctx)
}
