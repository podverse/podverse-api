import { Context } from 'koa'
import { generateToken } from 'utility'

export async function authenticate (ctx: Context) {
  ctx.body = await generateToken(ctx.state.user)
}
