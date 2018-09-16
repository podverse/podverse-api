export const emitError = (error, status, message, ctx) => {
  ctx.status = status || 500
  ctx.body = message || error.message
  ctx.app.emit('error', error, ctx)
}
